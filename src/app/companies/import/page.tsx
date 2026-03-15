"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { importCompaniesFromCSV } from "@/app/actions/import";

interface ParsedRow {
    name: string;
    dotNumber: string;
    email: string;
    phone: string;
}

export default function ImportCompaniesPage() {
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState("");
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    function parseCSV(text: string): ParsedRow[] {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return [];

        const header = lines[0].toLowerCase();
        const cols = header.split(",").map(c => c.trim());

        const nameIdx = cols.findIndex(c => c.includes("name") || c.includes("company"));
        const dotIdx = cols.findIndex(c => c.includes("dot") || c.includes("usdot"));
        const emailIdx = cols.findIndex(c => c.includes("email") || c.includes("mail"));
        const phoneIdx = cols.findIndex(c => c.includes("phone") || c.includes("tel"));

        return lines.slice(1).map(line => {
            const parts = line.split(",").map(p => p.trim().replace(/^"|"$/g, ""));
            return {
                name: nameIdx >= 0 ? parts[nameIdx] || "" : "",
                dotNumber: dotIdx >= 0 ? parts[dotIdx] || "" : "",
                email: emailIdx >= 0 ? parts[emailIdx] || "" : "",
                phone: phoneIdx >= 0 ? parts[phoneIdx] || "" : "",
            };
        }).filter(r => r.name);
    }

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const parsed = parseCSV(text);
            setRows(parsed);
        };
        reader.readAsText(file);
    }

    async function handleImport() {
        if (rows.length === 0) return;
        setImporting(true);
        setResult(null);

        try {
            const res = await importCompaniesFromCSV(rows);
            setResult(res);
            if (res.success) {
                setRows([]);
                setFileName("");
            }
        } catch {
            setResult({ success: false, message: "Something went wrong during import." });
        } finally {
            setImporting(false);
        }
    }

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/companies" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Companies
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Import Companies</CardTitle>
                            <CardDescription>Upload a CSV file to bulk-create company records.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-slate-50 border border-dashed border-[#77C7EC]/40 rounded-xl p-8 text-center">
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-[#3E91DE]/50 mb-4" />
                        <p className="text-sm text-[#143A82] font-medium mb-2">
                            {fileName || "Drop a CSV file or click to browse"}
                        </p>
                        <p className="text-xs text-[#3E91DE]/70 mb-4">
                            CSV should have columns: Company Name, DOT Number, Email, Phone
                        </p>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFile}
                            className="hidden"
                        />
                        <Button variant="outline" onClick={() => fileRef.current?.click()}>
                            Choose CSV File
                        </Button>
                    </div>

                    {rows.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#143A82] mb-3">
                                Preview ({rows.length} companies found)
                            </h3>
                            <div className="border border-[#77C7EC]/20 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="text-left p-3 font-medium text-[#143A82]">Company Name</th>
                                            <th className="text-left p-3 font-medium text-[#143A82]">DOT #</th>
                                            <th className="text-left p-3 font-medium text-[#143A82]">Email</th>
                                            <th className="text-left p-3 font-medium text-[#143A82]">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#77C7EC]/10">
                                        {rows.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="p-3 text-[#143A82] font-medium">{r.name}</td>
                                                <td className="p-3 text-slate-600">{r.dotNumber || "—"}</td>
                                                <td className="p-3 text-slate-600">{r.email || "—"}</td>
                                                <td className="p-3 text-slate-600">{r.phone || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => { setRows([]); setFileName(""); }}>
                                    Clear
                                </Button>
                                <Button onClick={handleImport} disabled={importing}>
                                    {importing ? "Importing..." : `Import ${rows.length} Companies`}
                                </Button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`flex items-center gap-2 p-4 rounded-lg border ${result.success
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                            }`}>
                            {result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-medium">{result.message}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
