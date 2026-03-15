import { prisma } from "@/lib/prisma"
import { FileSearch, Users, Building2, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic';

export default async function Home() {
  const companyCount = await prisma.company.count();
  const driverCount = await prisma.driver.count();
  const queryCount = await prisma.query.count({ where: { status: 'PENDING' } });

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringConsents = await prisma.consent.count({
    where: {
      status: 'ACTIVE',
      validUntil: { lte: thirtyDaysFromNow }
    }
  });

  const activeViolationsCount = await prisma.violation.count({
    where: { status: { not: 'CLEARED' } }
  });

  const expiringBulkQueriesCount = await prisma.company.count({
    where: {
      nextBulkQueryDueDate: { lte: thirtyDaysFromNow }
    }
  });

  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true, queryBalance: true, _count: { select: { drivers: true } } }
  });

  const companiesWithShortfall = allCompanies.filter(c => c.queryBalance < c._count.drivers);
  const shortfallCount = companiesWithShortfall.length;

  const actionsNeeded = expiringConsents + (activeViolationsCount > 0 ? 1 : 0) + (expiringBulkQueriesCount > 0 ? 1 : 0) + (shortfallCount > 0 ? 1 : 0);

  const stats = [
    { title: "Total Companies", value: companyCount, icon: Building2, trend: "Active clients", trendUp: true, href: "/companies" },
    { title: "Monitored Drivers", value: driverCount, icon: Users, trend: "Registered", trendUp: true, href: "/drivers" },
    { title: "Pending Queries", value: queryCount, icon: FileSearch, trend: "Awaiting results", trendUp: false, href: "/queries" },
    { title: "Action Needed", value: actionsNeeded, icon: AlertCircle, trend: "Requires attention", trendUp: false, alert: actionsNeeded > 0, href: "/alerts" },
  ];

  const recentQueries = await prisma.query.findMany({
    orderBy: { queryDate: 'desc' },
    take: 5,
    include: { driver: { select: { firstName: true, lastName: true } }, company: { select: { name: true } } }
  });

  return (
    <div className="p-8 pb-20 sm:p-12 bg-white min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Dashboard</h1>
          <p className="text-[#3E91DE] mt-1">Welcome back. Here is your overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/queries/new" className="px-4 py-2 bg-[#3E91DE] hover:bg-[#143A82] text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm">
            <FileSearch className="w-4 h-4" />
            New Query
          </Link>
          <Link href="/drivers/new" className="px-4 py-2 bg-white hover:bg-[#77C7EC]/10 text-[#143A82] border border-[#77C7EC]/30 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            Add Driver
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const inner = (
            <div key={idx} className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col transition-all hover:border-[#3E91DE]/30 hover:shadow-md ${stat.alert ? 'border-amber-200 bg-amber-50/30' : 'border-[#77C7EC]/20'} ${stat.href ? 'cursor-pointer' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${stat.alert ? 'bg-amber-100/50 text-amber-600' : 'bg-gradient-to-br from-[#77C7EC]/10 to-[#3E91DE]/10 text-[#3E91DE]'}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.href && stat.value > 0 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">Click to view</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#3E91DE] mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[#143A82]">{stat.value}</h3>
                <p className={`text-xs mt-2 font-medium ${stat.alert ? 'text-amber-600' : stat.trendUp ? 'text-[#3E91DE]' : 'text-[#77C7EC]'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          );
          if (stat.href) {
            return <a key={idx} href={stat.href} className="no-underline">{inner}</a>;
          }
          return inner;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ALERTS SECTION MOVED TO LEFT/PRIMARY COLUMN */}
        <div id="alerts" className="bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden flex flex-col scroll-mt-8">
          <div className="px-6 py-5 border-b border-[#77C7EC]/20 bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
            <h2 className="font-semibold text-[#143A82] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#3E91DE]" />
              Alerts & Actions
            </h2>
          </div>
          <div className="p-6 flex-1 bg-slate-50/30">
            <div className="space-y-4">
              {shortfallCount > 0 && (
                <div className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-white p-2 rounded-lg h-fit border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Query Plan Shortfalls</h4>
                    <p className="text-xs text-red-700 mt-1">{shortfallCount} companies have fewer query credits than active drivers. They will fail their annual bulk query.</p>
                    <Link href="/companies"><button className="text-xs font-semibold text-red-700 mt-2 hover:underline">Review Companies</button></Link>
                  </div>
                </div>
              )}
              {activeViolationsCount > 0 && (
                <div className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-white p-2 rounded-lg h-fit border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Drivers Prohibited</h4>
                    <p className="text-xs text-red-700 mt-1">{activeViolationsCount} drivers with prohibited status. Action required.</p>
                    <Link href="/violations"><button className="text-xs font-semibold text-red-700 mt-2 hover:underline">Review Details</button></Link>
                  </div>
                </div>
              )}
              {expiringConsents > 0 && (
                <div className="flex gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-white p-2 rounded-lg h-fit border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Expiring Consents</h4>
                    <p className="text-xs text-amber-700 mt-1">{expiringConsents} driver consents expiring within 30 days.</p>
                    <Link href="/drivers"><button className="text-xs font-semibold text-amber-700 mt-2 hover:underline">Review Drivers</button></Link>
                  </div>
                </div>
              )}
              {expiringBulkQueriesCount > 0 && (
                <div className="flex gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-white p-2 rounded-lg h-fit border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Bulk Queries Due</h4>
                    <p className="text-xs text-amber-700 mt-1">{expiringBulkQueriesCount} companies are due for annual bulk queries within 30 days.</p>
                    <Link href="/companies"><button className="text-xs font-semibold text-amber-700 mt-2 hover:underline">Review Companies</button></Link>
                  </div>
                </div>
              )}
              {activeViolationsCount === 0 && expiringConsents === 0 && expiringBulkQueriesCount === 0 && shortfallCount === 0 && (
                <div className="flex gap-4 p-6 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center text-center h-full min-h-[120px] shadow-sm">
                  <div>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-emerald-900">System Clear</h4>
                    <p className="text-xs text-emerald-700 mt-1">No pending actions required across all companies.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT QUERIES MOVED TO RIGHT COLUMN */}
        <div className="lg:col-span-2 bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
          <div className="px-6 py-5 border-b border-[#77C7EC]/20 flex justify-between items-center bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
            <h2 className="font-semibold text-[#143A82] flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#3E91DE]" />
              Recent Queries
            </h2>
            <Link href="/queries" className="text-sm text-[#3E91DE] hover:text-[#143A82] font-semibold flex items-center gap-1 transition-colors bg-[#3E91DE]/10 px-3 py-1.5 rounded-md hover:bg-[#3E91DE]/20">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 bg-slate-50/20">
            {recentQueries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
                <div className="w-16 h-16 bg-[#3E91DE]/10 rounded-full flex items-center justify-center mb-4">
                  <FileSearch className="w-8 h-8 text-[#3E91DE]" />
                </div>
                <p className="text-base font-semibold text-[#143A82]">No Queries Yet</p>
                <p className="text-sm mt-1 text-slate-500 max-w-sm">When you run pre-employment or annual queries on drivers, they will appear here in the real-time log.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentQueries.map((query) => (
                  <div key={query.id} className="p-5 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-[#143A82] group-hover:text-[#3E91DE] transition-colors">
                        {query.driver.firstName} {query.driver.lastName} <span className="text-slate-500 font-medium ml-1 bg-slate-100 px-2 rounded-md">({query.company.name})</span>
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${query.status === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        query.status === 'PROHIBITED' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                        {query.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3E91DE]"></div>
                        <span className="capitalize">{query.type.toLowerCase()} Query</span>
                      </div>
                      <span>{new Date(query.queryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
