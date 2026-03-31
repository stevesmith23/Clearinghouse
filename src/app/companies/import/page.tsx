"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { importCompaniesFromCSV } from "@/app/actions/import";

interface ParsedRow {
    name: string;
    dotNumber: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

/**
 * RFC 4180-compliant CSV parser that correctly handles:
 * - Quoted fields containing commas
 * - Escaped quotes ("") inside quoted fields
 * - Mixed quoted and unquoted fields
 */
function parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote ""
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                } else {
                    // End of quoted field
                    inQuotes = false;
                    i++;
                }
            } else {
                current += char;
                i++;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
                i++;
            } else if (char === ',') {
                fields.push(current.trim());
                current = "";
                i++;
            } else {
                current += char;
                i++;
            }
        }
    }
    fields.push(current.trim());
    return fields;
}

function parseCSV(text: string): { rows: ParsedRow[]; isI3Format: boolean; skippedInactive: number } {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { rows: [], isI3Format: false, skippedInactive: 0 };

    const headerFields = parseCSVLine(lines[0]);
    const cols = headerFields.map(c => c.toLowerCase().replace(/"/g, ""));

    // Detect I3 format by checking for signature columns
    const isI3Format = cols.includes("customer") && cols.includes("customer of") && cols.includes("org id");

    let nameIdx: number, dotIdx: number, emailIdx: number, phoneIdx: number;
    let addressIdx: number, cityIdx: number, stateIdx: number, zipIdx: number;
    let statusIdx: number;

    if (isI3Format) {
        // I3 CustomerCustomer layout
        nameIdx = cols.indexOf("customer");
        dotIdx = cols.indexOf("org id");
        emailIdx = -1; // I3 format doesn't include email
        phoneIdx = cols.indexOf("phone");
        addressIdx = cols.indexOf("address");
        cityIdx = cols.indexOf("city");
        stateIdx = cols.indexOf("state");
        zipIdx = cols.indexOf("zip");
        statusIdx = cols.indexOf("status");
    } else {
        // Generic / fallback column detection
        nameIdx = cols.findIndex(c => c.includes("name") || c.includes("company"));
        dotIdx = cols.findIndex(c => c.includes("dot") || c.includes("usdot"));
        emailIdx = cols.findIndex(c => c.includes("email") || c.includes("mail"));
        phoneIdx = cols.findIndex(c => c.includes("phone") || c.includes("tel"));
        addressIdx = cols.findIndex(c => c.includes("address") || c.includes("street"));
        cityIdx = cols.findIndex(c => c === "city");
        stateIdx = cols.findIndex(c => c === "state");
        zipIdx = cols.findIndex(c => c === "zip" || c.includes("postal"));
        statusIdx = -1;
    }

    let skippedInactive = 0;
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const parts = parseCSVLine(lines[i]);

        // Skip inactive companies if Status column exists
        if (statusIdx >= 0) {
            const status = (parts[statusIdx] || "").toLowerCase();
            if (status && status !== "active") {
                skippedInactive++;
                continue;
            }
        }

        const name = nameIdx >= 0 ? parts[nameIdx] || "" : "";
        if (!name) continue;

        rows.push({
            name,
            dotNumber: dotIdx >= 0 ? parts[dotIdx] || "" : "",
            email: emailIdx >= 0 ? parts[emailIdx] || "" : "",
            phone: phoneIdx >= 0 ? parts[phoneIdx] || "" : "",
            address: addressIdx >= 0 ? parts[addressIdx] || "" : "",
            city: cityIdx >= 0 ? parts[cityIdx] || "" : "",
            state: stateIdx >= 0 ? parts[stateIdx] || "" : "",
            zip: zipIdx >= 0 ? parts[zipIdx] || "" : "",
        });
    }

    return { rows, isI3Format, skippedInactive };
}

export default function ImportCompaniesPage() {
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState("");
    const [importing, setImporting] = useState(false);
    const [isI3Format, setIsI3Format] = useState(false);
    const [skippedInactive, setSkippedInactive] = useState(0);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const parsed = parseCSV(text);
            setRows(parsed.rows);
            setIsI3Format(parsed.isI3Format);
            setSkippedInactive(parsed.skippedInactive);
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
                setIsI3Format(false);
                setSkippedInactive(0);
            }
        } catch {
            setResult({ success: false, message: "Something went wrong during import." });
        } finally {
            setImporting(false);
        }
    }

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-[#1a1a2e] min-h-full max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/companies" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:text-white flex items-center gap-1 transition-colors">
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
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-[#77C7EC]/40 rounded-xl p-8 text-center">
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-[#3E91DE]/50 mb-4" />
                        <p className="text-sm text-[#143A82] dark:text-slate-200 font-medium mb-2">
                            {fileName || "Drop a CSV file or click to browse"}
                        </p>
                        <p className="text-xs text-[#3E91DE]/70 dark:text-slate-400 mb-4">
                            Supports <strong>I3 CustomerCustomer exports</strong> and generic CSV files
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

                    {isI3Format && rows.length > 0 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300">
                            <Info className="w-4 h-4 shrink-0" />
                            <p className="text-sm">
                                <strong>I3 format detected</strong> — Mapped columns: Customer → Name, Org Id → DOT#, Phone, Address, City, State, Zip
                                {skippedInactive > 0 && (
                                    <span className="ml-1">• {skippedInactive} inactive {skippedInactive === 1 ? 'company' : 'companies'} skipped</span>
                                )}
                            </p>
                        </div>
                    )}

                    {rows.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#143A82] dark:text-slate-200 mb-3">
                                Preview ({rows.length} {rows.length === 1 ? 'company' : 'companies'} found)
                            </h3>
                            <div className="border border-[#77C7EC]/20 dark:border-slate-700 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                        <tr>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">Company Name</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">DOT / Org ID</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">Phone</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">Address</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">City</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">State</th>
                                            <th className="text-left p-3 font-medium text-[#143A82] dark:text-slate-300">Zip</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#77C7EC]/10 dark:divide-slate-700">
                                        {rows.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <td className="p-3 text-[#143A82] dark:text-slate-200 font-medium">{r.name}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.dotNumber || "—"}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.phone || "—"}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.address || "—"}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.city || "—"}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.state || "—"}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400">{r.zip || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => { setRows([]); setFileName(""); setIsI3Format(false); setSkippedInactive(0); }}>
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
                            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
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
