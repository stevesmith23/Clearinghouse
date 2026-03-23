"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Building2, AlertTriangle, FileCheck, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DriverRow = {
    id: string;
    firstName: string;
    lastName: string;
    cdlNumber: string;
    cdlState: string;
    company: { name: string; id: string };
    consents: { id: string }[];
};

type SortKey = "name" | "cdl" | "company" | "consent";
type SortDir = "asc" | "desc";

function SortIcon({ column, active, dir }: { column: string; active: string; dir: SortDir }) {
    if (column !== active) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
    return dir === "asc"
        ? <ArrowUp className="w-3 h-3 text-[#3E91DE] ml-1 inline" />
        : <ArrowDown className="w-3 h-3 text-[#3E91DE] ml-1 inline" />;
}

export default function DriversTable({ drivers }: { drivers: DriverRow[] }) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        let result = drivers.filter((d) => {
            const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
            const reverseName = `${d.lastName} ${d.firstName}`.toLowerCase();
            return (
                fullName.includes(term) ||
                reverseName.includes(term) ||
                d.cdlNumber.toLowerCase().includes(term) ||
                d.company.name.toLowerCase().includes(term) ||
                d.cdlState.toLowerCase().includes(term)
            );
        });

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "name":
                    cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
                    break;
                case "cdl":
                    cmp = a.cdlNumber.localeCompare(b.cdlNumber);
                    break;
                case "company":
                    cmp = a.company.name.localeCompare(b.company.name);
                    break;
                case "consent":
                    cmp = (a.consents.length > 0 ? 1 : 0) - (b.consents.length > 0 ? 1 : 0);
                    break;
            }
            return sortDir === "desc" ? -cmp : cmp;
        });

        return result;
    }, [drivers, search, sortKey, sortDir]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Driver Registry</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3E91DE]/50" />
                    <Input
                        type="search"
                        placeholder="Search drivers..."
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
                            <TableHead className="cursor-pointer select-none hover:text-[#3E91DE] transition-colors" onClick={() => toggleSort("name")}>
                                Driver Name <SortIcon column="name" active={sortKey} dir={sortDir} />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none hover:text-[#3E91DE] transition-colors" onClick={() => toggleSort("cdl")}>
                                CDL Number <SortIcon column="cdl" active={sortKey} dir={sortDir} />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none hover:text-[#3E91DE] transition-colors" onClick={() => toggleSort("company")}>
                                Company <SortIcon column="company" active={sortKey} dir={sortDir} />
                            </TableHead>
                            <TableHead className="text-center cursor-pointer select-none hover:text-[#3E91DE] transition-colors" onClick={() => toggleSort("consent")}>
                                Consent Status <SortIcon column="consent" active={sortKey} dir={sortDir} />
                            </TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-[#3E91DE]/70">
                                    <Users className="w-8 h-8 mx-auto text-[#77C7EC] mb-3 opacity-50" />
                                    {search ? `No drivers matching "${search}".` : 'No drivers found. Click "Add Driver" to get started.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((driver) => (
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
    );
}
