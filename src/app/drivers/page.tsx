import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, Plus, Search, Building2, AlertTriangle, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
    const drivers = await prisma.driver.findMany({
        orderBy: { lastName: 'asc' },
        include: {
            company: { select: { name: true, id: true } },
            consents: { where: { status: 'ACTIVE' } }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Drivers</h1>
                    <p className="text-[#3E91DE] mt-1">Manage all drivers across your companies.</p>
                </div>
                <Link href="/drivers/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Driver
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Driver Registry</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3E91DE]/50" />
                        <Input
                            type="search"
                            placeholder="Search drivers..."
                            className="pl-8 bg-white"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 border-t-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Driver Name</TableHead>
                                <TableHead>CDL Number</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead className="text-center">Consent Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-[#3E91DE]/70">
                                        <Users className="w-8 h-8 mx-auto text-[#77C7EC] mb-3 opacity-50" />
                                        No drivers found. Click "Add Driver" to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drivers.map((driver) => (
                                    <TableRow key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-[#143A82]">
                                            <Link href={`/drivers/${driver.id}`} className="hover:underline">
                                                {driver.lastName}, {driver.firstName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {driver.cdlNumber} <span className="text-xs text-slate-400">({driver.cdlState})</span>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/companies/${driver.company.id}`} className="flex items-center gap-1.5 text-[#3E91DE] hover:text-[#143A82] transition-colors">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {driver.company.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {driver.consents.length > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    <FileCheck className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                                    <AlertTriangle className="w-3 h-3" /> Missing
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/drivers/${driver.id}`}>
                                                <Button variant="ghost" size="sm">Details</Button>
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
    )
}
