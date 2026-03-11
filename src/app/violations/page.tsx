import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShieldAlert, Plus, Search, User, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const dynamic = 'force-dynamic';

export default async function ViolationsPage() {
    const violations = await prisma.violation.findMany({
        orderBy: { violationDate: 'desc' },
        include: {
            driver: { select: { firstName: true, lastName: true, id: true, cdlNumber: true } }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Violations & RTD</h1>
                    <p className="text-[#3E91DE] mt-1">Monitor drivers with positive results or refusals, and track Return-To-Duty status.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Active Violations Record</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3E91DE]/50" />
                        <Input
                            type="search"
                            placeholder="Search violations..."
                            className="pl-8 bg-white"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Driver</TableHead>
                                <TableHead>Violation Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reported By</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {violations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-[#3E91DE]/70">
                                        <ShieldAlert className="w-8 h-8 mx-auto text-[#77C7EC] mb-3 opacity-50" />
                                        No violations found. That's a good thing!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                violations.map((violation) => (
                                    <TableRow key={violation.id}>
                                        <TableCell className="font-medium text-[#143A82]">
                                            <Link href={`/drivers/${violation.driver.id}`} className="flex items-center gap-1.5 hover:underline transition-colors">
                                                <User className="w-3.5 h-3.5 text-[#3E91DE]" />
                                                {violation.driver.lastName}, {violation.driver.firstName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(violation.violationDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded font-medium">
                                                {violation.violationType.replace(/_/g, ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-[#3E91DE] text-sm">
                                            {violation.reportedBy}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${violation.status === 'CLEARED' ? 'bg-green-100 text-green-800' :
                                                    violation.status === 'RTD_ELIGIBLE' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {violation.status.replace(/_/g, ' ')}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
