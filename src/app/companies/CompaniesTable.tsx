"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CompanyRow = {
    id: string;
    name: string;
    dotNumber: string | null;
    email: string | null;
    phone: string | null;
    queryBalance: number;
    lastBulkQueryDate: Date | null;
    nextBulkQueryDueDate: Date | null;
    _count: { drivers: number };
};

export function CompaniesTable({ companies }: { companies: CompanyRow[] }) {
    const [search, setSearch] = useState("");

    const filtered = companies.filter((c) => {
        const term = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(term) ||
            (c.dotNumber && c.dotNumber.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.phone && c.phone.toLowerCase().includes(term))
        );
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>All Companies</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3E91DE]/50" />
                    <Input
                        type="search"
                        placeholder="Search companies..."
                        className="pl-8 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 border-t-0">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>DOT Number</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-right">Drivers</TableHead>
                            <TableHead className="text-right">Last Bulk Query</TableHead>
                            <TableHead className="text-right">Next Due Date</TableHead>
                            <TableHead className="text-right">Query Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-[#3E91DE]/70">
                                    <Building2 className="w-8 h-8 mx-auto text-[#77C7EC] mb-3 opacity-50" />
                                    {search ? `No companies matching "${search}".` : 'No companies found. Click "Add Company" to get started.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((company) => (
                                <TableRow key={company.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <Link href={`/companies/${company.id}`} className="hover:underline text-[#143A82]">
                                            {company.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{company.dotNumber || <span className="text-slate-400 italic">N/A</span>}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 text-xs text-[#3E91DE]">
                                            {company.email && <span>{company.email}</span>}
                                            {company.phone && <span>{company.phone}</span>}
                                            {!company.email && !company.phone && <span className="text-slate-400 italic">No contact info</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5 font-medium">
                                            <Users className="w-3.5 h-3.5 text-[#77C7EC]" />
                                            {company._count.drivers}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {company.lastBulkQueryDate ? new Date(company.lastBulkQueryDate).toLocaleDateString() : <span className="text-slate-400 italic">Never</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {company.nextBulkQueryDueDate ? (
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${new Date(company.nextBulkQueryDueDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {new Date(company.nextBulkQueryDueDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Not set</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${company.queryBalance > 5 ? 'bg-green-100 text-green-800' : company.queryBalance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                            {company.queryBalance}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
