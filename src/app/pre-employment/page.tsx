import { getPreEmploymentDrivers } from "@/app/actions/pre-employment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function PreEmploymentPage() {
    const drivers = await getPreEmploymentDrivers()

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#143A82]">Pre-Employment Tracking</h2>
                    <p className="text-muted-foreground mt-2">
                        Drivers who are missing a completed &quot;FULL&quot; query. These drivers must be queried before performing safety-sensitive functions.
                    </p>
                </div>
            </div>

            <Card className="border-t-4 border-t-[#3E91DE] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Pending Pre-Employment Queries</CardTitle>
                        <CardDescription>Found {drivers.length} driver(s) needing attention.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {drivers.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">All Caught Up!</h3>
                            <p className="text-slate-500 mt-1">Every driver in the system has a completed FULL query on file.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Driver Name</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>CDL Info</TableHead>
                                        <TableHead>Date of Birth</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow key={driver.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium">
                                                <Link href={`/drivers/${driver.id}`} className="text-[#3E91DE] hover:underline flex items-center gap-1">
                                                    {driver.firstName} {driver.lastName}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/companies/${driver.companyId}`} className="text-slate-600 hover:text-[#143A82] hover:underline">
                                                    {driver.companyName}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{driver.cdlNumber}</TableCell>
                                            <TableCell className="text-slate-600">
                                                {driver.dob ? driver.dob.toLocaleDateString() : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {driver.status === "Needs FULL Query" ? (
                                                    <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        {driver.status}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {driver.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/queries/new?driverId=${driver.id}`}>
                                                    <Button size="sm" className="bg-[#143A82] hover:bg-[#143A82]/90">
                                                        Log Query
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
