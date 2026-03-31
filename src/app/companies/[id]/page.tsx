import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Mail, Phone, Hash, ChevronRight, UserPlus, FileSearch, Download, Edit, FileText, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReminderButton } from "./ReminderButton"
import { EditBulkDateButton } from "./EditBulkDateButton"

export const dynamic = 'force-dynamic';

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            drivers: {
                orderBy: { lastName: 'asc' },
                include: {
                    consents: { where: { status: 'ACTIVE' } }
                }
            },
            queries: {
                orderBy: { queryDate: 'desc' },
                take: 5,
                include: { driver: true }
            }
        }
    })

    if (!company) {
        notFound()
    }

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full">
            <div className="mb-6">
                <Link href="/companies" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:text-white flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Companies
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#77C7EC]/10 to-[#3E91DE]/10 rounded-xl text-[#3E91DE]">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white">{company.name}</h1>
                            <Link href={`/companies/edit?id=${company.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#3E91DE] hover:text-[#143A82] dark:text-white hover:bg-[#77C7EC]/10">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-[#3E91DE]">
                            {company.dotNumber && (
                                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> DOT: {company.dotNumber}</span>
                            )}
                            {company.email && (
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {company.email}</span>
                            )}
                            {company.phone && (
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {company.phone}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                    <div className="px-4 py-2 flex flex-col items-center border-r border-[#77C7EC]/20">
                        <span className="text-xs font-semibold text-[#3E91DE] uppercase tracking-wider">Query Balance</span>
                        <span className={`text-xl font-bold ${company.queryBalance > 5 ? 'text-green-600' : company.queryBalance > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            {company.queryBalance}
                        </span>
                    </div>
                    <div className="px-4 py-2 flex flex-col items-center border-r border-[#77C7EC]/20">
                        <span className="text-xs font-semibold text-[#3E91DE] uppercase tracking-wider">Drivers</span>
                        <span className="text-xl font-bold text-[#143A82] dark:text-white">{company.drivers.length}</span>
                    </div>
                    <div className="px-4 py-2 flex flex-col items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-[#3E91DE] uppercase tracking-wider">Bulk Date Due</span>
                            <EditBulkDateButton companyId={company.id} initialDate={company.lastBulkQueryDate} />
                        </div>
                        <span className={`text-lg font-bold ${!company.nextBulkQueryDueDate ? 'text-slate-400' :
                            new Date(company.nextBulkQueryDueDate) < new Date() ? 'text-red-600' :
                                (new Date(company.nextBulkQueryDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 30 ? 'text-amber-600' : 'text-[#143A82] dark:text-white'
                            }`}>
                            {company.nextBulkQueryDueDate ? company.nextBulkQueryDueDate.toLocaleDateString() : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Drivers Registry</CardTitle>
                                <Link href={`/drivers/new?companyId=${company.id}`}>
                                    <Button size="sm" className="bg-[#3E91DE] hover:bg-[#143A82] text-white">
                                        <UserPlus className="w-4 h-4 mr-1" /> Add Driver
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <ReminderButton companyId={company.id} hasEmail={!!company.email} type="buy-queries" hasDeadline={!!company.nextBulkQueryDueDate} />
                                <ReminderButton companyId={company.id} hasEmail={!!company.email} type="update-roster" hasDeadline={!!company.nextBulkQueryDueDate} />
                                <Link target="_blank" href={`/api/export/bulk-queries?companyId=${company.id}`}>
                                    <Button size="sm" variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                                        <Download className="w-4 h-4 mr-1" /> Export Bulk List
                                    </Button>
                                </Link>
                                <Link target="_blank" href={`/api/export/fmcsa-bulk?companyId=${company.id}`}>
                                    <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                        <FileText className="w-4 h-4 mr-1" /> FMCSA Upload CSV
                                    </Button>
                                </Link>
                                <Link target="_blank" href={`/api/export/audit-report?companyId=${company.id}`}>
                                    <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                        <ClipboardList className="w-4 h-4 mr-1" /> Audit Report
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 border-t-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Driver Name</TableHead>
                                        <TableHead>CDL Number</TableHead>
                                        <TableHead>Active Consents</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {company.drivers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-[#3E91DE]/70">
                                                No drivers registered for this company yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        company.drivers.map((driver) => (
                                            <TableRow key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium text-[#143A82] dark:text-white">
                                                    {driver.lastName}, {driver.firstName}
                                                </TableCell>
                                                <TableCell className="text-[#3E91DE]">
                                                    {driver.cdlNumber} <span className="text-xs text-slate-400">({driver.cdlState})</span>
                                                </TableCell>
                                                <TableCell>
                                                    {driver.consents.length > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            {driver.consents.length} Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            No Active Consents
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/drivers/${driver.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Queries</CardTitle>
                            <Link href={`/queries/new?companyId=${company.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Log Query</span>
                                    <FileSearch className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0 border-t-0">
                            <div className="divide-y divide-[#77C7EC]/10">
                                {company.queries.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-sm text-[#3E91DE]/70">
                                        No queries have been logged yet.
                                    </div>
                                ) : (
                                    company.queries.map((query) => (
                                        <div key={query.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-sm text-[#143A82] dark:text-white">
                                                    {query.driver.firstName} {query.driver.lastName}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${query.status === 'ELIGIBLE' ? 'bg-green-100 text-green-800' :
                                                    query.status === 'PROHIBITED' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {query.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-[#3E91DE]">
                                                <span className="capitalize">{query.type.toLowerCase()} Query</span>
                                                <span>{new Date(query.queryDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {company.queries.length > 0 && (
                                <div className="p-4 border-t border-[#77C7EC]/10 text-center">
                                    <Link href={`/queries?companyId=${company.id}`} className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:text-white">
                                        View all query history
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
