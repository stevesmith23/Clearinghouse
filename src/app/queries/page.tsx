import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FileSearch, Plus, Search, Building2, User, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic';

export default async function QueriesPage() {
    const queries = await prisma.query.findMany({
        orderBy: { queryDate: 'desc' },
        include: {
            company: { select: { name: true, id: true } },
            driver: { select: { firstName: true, lastName: true, id: true } }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Query Log</h1>
                    <p className="text-[#3E91DE] mt-1">Master record of all clearinghouse queries across all companies.</p>
                </div>
                <Link href="/queries/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Log New Query
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Query History</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3E91DE]/50" />
                        <Input
                            type="search"
                            placeholder="Search queries..."
                            className="pl-8 bg-white"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 border-t-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead className="text-right">Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-[#3E91DE]/70">
                                        <FileSearch className="w-8 h-8 mx-auto text-[#77C7EC] mb-3 opacity-50" />
                                        No queries found. Click "Log New Query" to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                queries.map((query) => (
                                    <TableRow key={query.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="font-medium text-slate-900">
                                            {new Date(query.queryDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${query.type === 'FULL' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {query.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/drivers/${query.driver.id}`} className="flex items-center gap-1.5 text-[#3E91DE] hover:text-[#143A82] transition-colors">
                                                <User className="w-3.5 h-3.5" />
                                                {query.driver.lastName}, {query.driver.firstName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/companies/${query.company.id}`} className="flex items-center gap-1.5 text-[#3E91DE] hover:text-[#143A82] transition-colors">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {query.company.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {query.documentUrl ? (
                                                <a href={query.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#3E91DE] hover:text-[#143A82] hover:underline transition-colors">
                                                    <LinkIcon className="w-3.5 h-3.5" /> Result PDF
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No file attached</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${query.status === 'ELIGIBLE' ? 'bg-green-100 text-green-800' :
                                                query.status === 'PROHIBITED' ? 'bg-red-100 text-red-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                {query.status}
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
