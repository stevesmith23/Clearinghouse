import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
    AlertCircle, ShieldAlert, Clock, CreditCard, FileSearch,
    CheckCircle2, ArrowRight, Building2, Users, UserX, ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    // 1. Prohibited drivers (active violations)
    const activeViolations = await prisma.violation.findMany({
        where: { status: { not: 'CLEARED' } },
        include: {
            driver: {
                include: { company: { select: { name: true } } }
            }
        },
        orderBy: { violationDate: 'desc' }
    });

    // 2. Expiring consents (within 30 days)
    const expiringConsentsList = await prisma.consent.findMany({
        where: {
            status: 'ACTIVE',
            validUntil: { lte: thirtyDaysFromNow }
        },
        include: {
            driver: {
                include: { company: { select: { name: true } } }
            }
        },
        orderBy: { validUntil: 'asc' }
    });

    // 3. Bulk queries due (within 30 days)
    const bulkQueriesDue = await prisma.company.findMany({
        where: {
            nextBulkQueryDueDate: { lte: thirtyDaysFromNow }
        },
        include: {
            _count: { select: { drivers: true } }
        },
        orderBy: { nextBulkQueryDueDate: 'asc' }
    });

    // 4. Query plan shortfalls
    const allCompanies = await prisma.company.findMany({
        select: { id: true, name: true, queryBalance: true, _count: { select: { drivers: true } } }
    });
    const companiesWithShortfall = allCompanies.filter(c => c.queryBalance < c._count.drivers);

    // 5. Drivers without active consent
    const driversWithoutConsent = await prisma.driver.findMany({
        where: {
            consents: { none: { status: 'ACTIVE' } }
        },
        include: { company: { select: { name: true } } },
        orderBy: { lastName: 'asc' }
    });

    // 6. Overdue queries (drivers whose next query date has passed)
    const overdueDrivers = await prisma.driver.findMany({
        where: {
            nextQueryDueDate: { lt: now }
        },
        include: { company: { select: { name: true } } },
        orderBy: { nextQueryDueDate: 'asc' }
    });

    const totalAlerts = activeViolations.length
        + expiringConsentsList.length
        + bulkQueriesDue.length
        + companiesWithShortfall.length
        + driversWithoutConsent.length
        + overdueDrivers.length;

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82] flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-[#3E91DE]" />
                        Alerts & Action Items
                    </h1>
                    <p className="text-[#3E91DE] mt-1">Tasks that need your attention across all companies and drivers.</p>
                </div>
                {totalAlerts === 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> All Clear
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold border border-red-200">
                        <AlertCircle className="w-4 h-4" /> {totalAlerts} Items Need Attention
                    </span>
                )}
            </div>

            <div className="space-y-8">
                {/* CRITICAL: Prohibited Drivers */}
                <Card className={activeViolations.length > 0 ? "border-red-200 shadow-md" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${activeViolations.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Prohibited Drivers</CardTitle>
                                <CardDescription>Drivers with active violations who must be removed from safety-sensitive functions.</CardDescription>
                            </div>
                        </div>
                        {activeViolations.length > 0 && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">{activeViolations.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {activeViolations.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ No prohibited drivers. All clear.</p>
                        ) : (
                            <div className="divide-y divide-red-100">
                                {activeViolations.map(v => (
                                    <div key={v.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{v.driver.firstName} {v.driver.lastName}</p>
                                            <p className="text-xs text-slate-500">{v.driver.company.name} · {v.violationType.replace(/_/g, ' ')} · Status: <span className="font-semibold text-red-600">{v.status.replace(/_/g, ' ')}</span></p>
                                        </div>
                                        <Link href={`/drivers/${v.driverId}`}>
                                            <Button variant="ghost" size="sm">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Overdue Queries */}
                <Card className={overdueDrivers.length > 0 ? "border-red-200" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${overdueDrivers.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <FileSearch className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Overdue Queries</CardTitle>
                                <CardDescription>Drivers whose annual queries are past due.</CardDescription>
                            </div>
                        </div>
                        {overdueDrivers.length > 0 && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">{overdueDrivers.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {overdueDrivers.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ All driver queries are up to date.</p>
                        ) : (
                            <div className="divide-y divide-red-100">
                                {overdueDrivers.slice(0, 10).map(d => (
                                    <div key={d.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{d.firstName} {d.lastName}</p>
                                            <p className="text-xs text-slate-500">{d.company.name} · Due: <span className="font-semibold text-red-600">{d.nextQueryDueDate?.toLocaleDateString()}</span></p>
                                        </div>
                                        <Link href={`/queries/new?driverId=${d.id}&companyId=${d.companyId}`}>
                                            <Button size="sm" variant="outline">Log Query</Button>
                                        </Link>
                                    </div>
                                ))}
                                {overdueDrivers.length > 10 && (
                                    <p className="text-xs text-slate-500 py-2 text-center">...and {overdueDrivers.length - 10} more</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Queries Due */}
                <Card className={bulkQueriesDue.length > 0 ? "border-amber-200" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${bulkQueriesDue.length > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Bulk Queries Due</CardTitle>
                                <CardDescription>Companies with annual bulk queries due within 30 days.</CardDescription>
                            </div>
                        </div>
                        {bulkQueriesDue.length > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">{bulkQueriesDue.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {bulkQueriesDue.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ No bulk queries due in the next 30 days.</p>
                        ) : (
                            <div className="divide-y divide-amber-100">
                                {bulkQueriesDue.map(c => (
                                    <div key={c.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{c.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {c._count.drivers} drivers · Due: <span className={`font-semibold ${c.nextBulkQueryDueDate && c.nextBulkQueryDueDate < now ? "text-red-600" : "text-amber-600"}`}>
                                                    {c.nextBulkQueryDueDate?.toLocaleDateString()}
                                                </span>
                                                {c.nextBulkQueryDueDate && c.nextBulkQueryDueDate < now && " (OVERDUE)"}
                                            </p>
                                        </div>
                                        <Link href={`/companies/${c.id}`}>
                                            <Button variant="ghost" size="sm">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Query Plan Shortfalls */}
                <Card className={companiesWithShortfall.length > 0 ? "border-amber-200" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${companiesWithShortfall.length > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Query Plan Shortfalls</CardTitle>
                                <CardDescription>Companies that need to purchase more query credits.</CardDescription>
                            </div>
                        </div>
                        {companiesWithShortfall.length > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">{companiesWithShortfall.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {companiesWithShortfall.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ All companies have enough query credits.</p>
                        ) : (
                            <div className="divide-y divide-amber-100">
                                {companiesWithShortfall.map(c => (
                                    <div key={c.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{c.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Balance: <span className="font-semibold text-red-600">{c.queryBalance}</span> · Drivers: {c._count.drivers} · <span className="text-red-600 font-semibold">Needs {c._count.drivers - c.queryBalance} more</span>
                                            </p>
                                        </div>
                                        <Link href={`/companies/${c.id}`}>
                                            <Button variant="ghost" size="sm">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Expiring Consents */}
                <Card className={expiringConsentsList.length > 0 ? "border-amber-200" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${expiringConsentsList.length > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Expiring Consents</CardTitle>
                                <CardDescription>Driver consents that expire within 30 days.</CardDescription>
                            </div>
                        </div>
                        {expiringConsentsList.length > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">{expiringConsentsList.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {expiringConsentsList.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ No consents expiring in the next 30 days.</p>
                        ) : (
                            <div className="divide-y divide-amber-100">
                                {expiringConsentsList.map(c => (
                                    <div key={c.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{c.driver.firstName} {c.driver.lastName}</p>
                                            <p className="text-xs text-slate-500">{c.driver.company.name} · {c.type} consent · Expires: <span className="font-semibold text-amber-600">{c.validUntil?.toLocaleDateString()}</span></p>
                                        </div>
                                        <Link href={`/drivers/${c.driverId}`}>
                                            <Button variant="ghost" size="sm">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Missing Consents */}
                <Card className={driversWithoutConsent.length > 0 ? "border-slate-300" : "border-[#77C7EC]/20"}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${driversWithoutConsent.length > 0 ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-600"}`}>
                                <UserX className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Drivers Missing Consent</CardTitle>
                                <CardDescription>Drivers with no active consent form on file.</CardDescription>
                            </div>
                        </div>
                        {driversWithoutConsent.length > 0 && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">{driversWithoutConsent.length}</span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {driversWithoutConsent.length === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium">✓ All drivers have active consent forms.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {driversWithoutConsent.slice(0, 10).map(d => (
                                    <div key={d.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-[#143A82]">{d.firstName} {d.lastName}</p>
                                            <p className="text-xs text-slate-500">{d.company.name}</p>
                                        </div>
                                        <Link href={`/drivers/${d.id}`}>
                                            <Button variant="ghost" size="sm">Add Consent <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                        </Link>
                                    </div>
                                ))}
                                {driversWithoutConsent.length > 10 && (
                                    <p className="text-xs text-slate-500 py-2 text-center">...and {driversWithoutConsent.length - 10} more</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
