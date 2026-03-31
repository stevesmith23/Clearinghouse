import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Building2, CreditCard, Calendar, FileCheck, ShieldAlert, CheckCircle2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addConsent, revokeConsent } from "@/app/actions/drivers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DriverNotes from "./DriverNotes"

export const dynamic = 'force-dynamic';

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const driver = await prisma.driver.findUnique({
        where: { id },
        include: {
            company: true,
            consents: { orderBy: { createdAt: 'desc' } },
            queries: { orderBy: { queryDate: 'desc' } },
            violations: { orderBy: { violationDate: 'desc' } },
            notes: { orderBy: { createdAt: 'desc' } }
        }
    })

    if (!driver) {
        notFound()
    }

    const activeConsent = driver.consents.find(c => c.status === 'ACTIVE');

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full">
            <div className="mb-6">
                <Link href={`/companies/${driver.companyId}`} className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:text-white flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to {driver.company.name}
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl text-indigo-700">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white">
                            {driver.firstName} {driver.lastName}
                        </h1>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#3E91DE]">
                            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> CDL: {driver.cdlNumber} ({driver.cdlState})</span>
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <Link href={`/companies/${driver.companyId}`} className="hover:underline">{driver.company.name}</Link>
                            </span>
                        </div>
                    </div>
                </div>
                <Link href={`/drivers/edit?id=${driver.id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit Driver
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Compliance Status Card */}
                <Card className={driver.violations.some(v => v.status !== 'CLEARED') ? 'border-red-200 bg-red-50/10' : 'border-[#77C7EC]/20'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {driver.violations.some(v => v.status !== 'CLEARED') ? (
                                <><ShieldAlert className="w-5 h-5 text-red-500" /> Prohibited Status</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5 text-green-500" /> Eligible Status</>
                            )}
                        </CardTitle>
                        <CardDescription>Current FMCSA ClearinghouseGroup status for this driver.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Last Query</span>
                                <p className="font-medium text-slate-900 mt-1">
                                    {driver.lastQueryDate ? new Date(driver.lastQueryDate).toLocaleDateString() : 'Never queried'}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Next Query Due</span>
                                <p className={`font-medium mt-1 ${driver.nextQueryDueDate && new Date(driver.nextQueryDueDate) < new Date() ? 'text-red-600' : 'text-slate-900'}`}>
                                    {driver.nextQueryDueDate ? new Date(driver.nextQueryDueDate).toLocaleDateString() : 'Needs Setup'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Center Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Driver Actions</CardTitle>
                        <CardDescription>Perform actions for this driver.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            <Link href={`/queries/new?driverId=${driver.id}&companyId=${driver.companyId}`}>
                                <Button className="w-full justify-start text-left h-12">
                                    <FileCheck className="w-4 h-4 mr-3" />
                                    Log New Clearinghouse Query
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Constent Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Consent Management</CardTitle>
                            <CardDescription>Track general and limited consents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeConsent && (
                                <div className="mb-6 p-4 rounded-lg border border-green-200 bg-green-50 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-green-800 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Active {activeConsent.type} Consent
                                        </h4>
                                        <p className="text-sm text-green-700 mt-0.5">
                                            Valid until: {activeConsent.validUntil ? new Date(activeConsent.validUntil).toLocaleDateString() : 'Indefinite'}
                                        </p>
                                    </div>
                                    <form action={async () => { "use server"; await revokeConsent(activeConsent.id, driver.id); }}>
                                        <Button variant="danger" size="sm" type="submit">Revoke</Button>
                                    </form>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 mb-6">
                                <h4 className="font-medium text-sm text-[#143A82] dark:text-white mb-3">Upload New Consent</h4>
                                <form action={addConsent} className="flex flex-wrap items-end gap-3">
                                    <input type="hidden" name="driverId" value={driver.id} />
                                    <div className="flex-1 min-w-[200px]">
                                        <Label htmlFor="type" className="text-xs">Consent Type</Label>
                                        <select id="type" name="type" className="mt-1 flex h-9 w-full rounded-md border border-[#77C7EC]/40 bg-white px-3 py-1 text-sm text-[#143A82] dark:text-white shadow-sm">
                                            <option value="LIMITED">Limited (General)</option>
                                            <option value="FULL">Full (Pre-Employment)</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <Label htmlFor="validUntil" className="text-xs">Valid Until (Optional)</Label>
                                        <Input id="validUntil" name="validUntil" type="date" className="mt-1 h-9" />
                                    </div>
                                    <Button type="submit" size="sm" className="h-9">Add Consent</Button>
                                </form>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Valid Until</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {driver.consents.map(consent => (
                                        <TableRow key={consent.id}>
                                            <TableCell className="font-medium">{consent.type}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${consent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    consent.status === 'REVOKED' ? 'bg-red-100 text-red-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {consent.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{consent.validUntil ? new Date(consent.validUntil).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-slate-500">{new Date(consent.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {driver.consents.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-slate-500">No consents recorded.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    {/* Query History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Query History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-[#77C7EC]/10">
                                {driver.queries.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-sm text-[#3E91DE]/70">
                                        No queries have been logged for this driver.
                                    </div>
                                ) : (
                                    driver.queries.map((query) => (
                                        <div key={query.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-sm text-[#143A82] dark:text-white">
                                                    {query.type} Query
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${query.status === 'ELIGIBLE' ? 'bg-green-100 text-green-800' :
                                                    query.status === 'PROHIBITED' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {query.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-[#3E91DE]">
                                                <span>{new Date(query.queryDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Driver Notes */}
            <div className="mt-8">
                <DriverNotes driverId={driver.id} notes={driver.notes} />
            </div>
        </div>
    )
}
