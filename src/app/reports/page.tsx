import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
    Building2,
    Users,
    FileSearch,
    TrendingUp,
    UserCheck,
    AlertTriangle,
    BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    await requireAuth("ADMIN");

    // ---- Stat Cards ----
    const totalCompanies = await prisma.company.count();
    const totalDrivers = await prisma.driver.count();
    const totalQueries = await prisma.query.count();

    // ---- Monthly Growth ----
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const companiesThisMonth = await prisma.company.count({
        where: { createdAt: { gte: startOfThisMonth } },
    });
    const companiesLastMonth = await prisma.company.count({
        where: {
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        },
    });
    const driversThisMonth = await prisma.driver.count({
        where: { createdAt: { gte: startOfThisMonth } },
    });
    const driversLastMonth = await prisma.driver.count({
        where: {
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        },
    });

    // ---- Query Breakdown (last 6 months) ----
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const allRecentQueries = await prisma.query.findMany({
        where: { queryDate: { gte: sixMonthsAgo } },
        select: { queryDate: true, type: true },
        orderBy: { queryDate: "asc" },
    });

    const monthlyBreakdown: Record<
        string,
        { full: number; limited: number; total: number }
    > = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
        monthlyBreakdown[key] = { full: 0, limited: 0, total: 0 };
    }
    for (const q of allRecentQueries) {
        const key = new Date(q.queryDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
        if (monthlyBreakdown[key]) {
            monthlyBreakdown[key].total++;
            if (q.type === "FULL") monthlyBreakdown[key].full++;
            else monthlyBreakdown[key].limited++;
        }
    }

    // ---- Pre-Employment Completion Rate ----
    const allDriverIds = await prisma.driver.findMany({
        select: { id: true },
    });
    const driversWithFullQuery = await prisma.query.findMany({
        where: { type: "FULL", status: "ELIGIBLE" },
        select: { driverId: true },
        distinct: ["driverId"],
    });
    const completionRate =
        allDriverIds.length > 0
            ? Math.round((driversWithFullQuery.length / allDriverIds.length) * 100)
            : 0;

    // ---- Violations Summary ----
    const activeViolations = await prisma.violation.count({
        where: { status: { not: "CLEARED" } },
    });
    const clearedViolations = await prisma.violation.count({
        where: { status: "CLEARED" },
    });

    const stats = [
        {
            title: "Total Companies",
            value: totalCompanies,
            icon: Building2,
            sub: `+${companiesThisMonth} this month`,
            href: "/companies",
        },
        {
            title: "Total Drivers",
            value: totalDrivers,
            icon: Users,
            sub: `+${driversThisMonth} this month`,
            href: "/drivers",
        },
        {
            title: "Total Queries Logged",
            value: totalQueries,
            icon: FileSearch,
            sub: "All-time",
            href: "/queries",
        },
        {
            title: "Pre-Emp Completion",
            value: `${completionRate}%`,
            icon: UserCheck,
            sub: `${driversWithFullQuery.length} of ${allDriverIds.length} drivers`,
            href: "/pre-employment",
        },
    ];

    return (
        <div className="p-8 pb-20 sm:p-12 bg-white dark:bg-slate-900 min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-[#3E91DE]" />
                    Reports & Analytics
                </h1>
                <p className="text-[#3E91DE] mt-1">
                    Growth metrics and operational KPIs.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <Link
                        key={idx}
                        href={stat.href}
                        className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#77C7EC]/20 shadow-sm flex flex-col transition-all hover:border-[#3E91DE]/30 hover:shadow-md cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-[#77C7EC]/10 to-[#3E91DE]/10 text-[#3E91DE]">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-[#3E91DE] bg-[#3E91DE]/10 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Click to view</span>
                        </div>
                        <p className="text-sm font-medium text-[#3E91DE] mb-1">
                            {stat.title}
                        </p>
                        <h3 className="text-3xl font-bold text-[#143A82] dark:text-white">{stat.value}</h3>
                        <p className="text-xs mt-2 font-medium text-[#77C7EC]">
                            {stat.sub}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Query Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#143A82] dark:text-white">
                            <TrendingUp className="w-5 h-5 text-[#3E91DE]" />
                            Query Volume (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 pr-4 font-semibold text-[#143A82] dark:text-white">
                                            Month
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#143A82] dark:text-white">
                                            Pre-Emp (FULL)
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#143A82] dark:text-white">
                                            Bulk (LIMITED)
                                        </th>
                                        <th className="text-right py-3 pl-4 font-semibold text-[#143A82] dark:text-white">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(monthlyBreakdown).map(
                                        ([month, data]) => (
                                            <tr
                                                key={month}
                                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="py-3 pr-4 font-medium text-slate-700">
                                                    {month}
                                                </td>
                                                <td className="py-3 px-4 text-right text-[#3E91DE] font-semibold">
                                                    {data.full}
                                                </td>
                                                <td className="py-3 px-4 text-right text-[#77C7EC] font-semibold">
                                                    {data.limited}
                                                </td>
                                                <td className="py-3 pl-4 text-right font-bold text-[#143A82] dark:text-white">
                                                    {data.total}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth & Violations */}
                <div className="space-y-8">
                    {/* Monthly Growth */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#143A82] dark:text-white">
                                <Building2 className="w-5 h-5 text-[#3E91DE]" />
                                Monthly Growth Comparison
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">
                                            New Companies
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-[#143A82] dark:text-white">
                                                {companiesThisMonth}
                                            </span>
                                            <span className="text-sm text-slate-500">this month</span>
                                            <span className="text-xs text-slate-400">
                                                vs {companiesLastMonth} last month
                                            </span>
                                        </div>
                                    </div>
                                    {companiesThisMonth > companiesLastMonth && (
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                            ↑ Growing
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">
                                            New Drivers
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-[#143A82] dark:text-white">
                                                {driversThisMonth}
                                            </span>
                                            <span className="text-sm text-slate-500">this month</span>
                                            <span className="text-xs text-slate-400">
                                                vs {driversLastMonth} last month
                                            </span>
                                        </div>
                                    </div>
                                    {driversThisMonth > driversLastMonth && (
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                            ↑ Growing
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Violations Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#143A82] dark:text-white">
                                <AlertTriangle className="w-5 h-5 text-[#3E91DE]" />
                                Violations Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 rounded-lg bg-red-50 border border-red-100 text-center">
                                    <p className="text-3xl font-bold text-red-700">
                                        {activeViolations}
                                    </p>
                                    <p className="text-xs font-medium text-red-600 mt-1">
                                        Active
                                    </p>
                                </div>
                                <div className="flex-1 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                                    <p className="text-3xl font-bold text-emerald-700">
                                        {clearedViolations}
                                    </p>
                                    <p className="text-xs font-medium text-emerald-600 mt-1">
                                        Cleared
                                    </p>
                                </div>
                                <div className="flex-1 p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                                    <p className="text-3xl font-bold text-[#143A82] dark:text-white">
                                        {activeViolations + clearedViolations}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">
                                        All-Time
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
