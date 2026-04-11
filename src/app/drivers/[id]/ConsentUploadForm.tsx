"use client";

import { useState, useRef } from "react";
import { addConsent } from "@/app/actions/drivers";
import { Upload, FileCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConsentUploadForm({ driverId }: { driverId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setUploading(true);

        try {
            let documentUrl = "";

            // Upload file first if one is selected
            if (file) {
                const uploadData = new FormData();
                uploadData.append("file", file);

                const res = await fetch("/api/upload/consent", {
                    method: "POST",
                    body: uploadData,
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Upload failed");
                }

                const data = await res.json();
                documentUrl = data.url;
            }

            // Add documentUrl to form data
            formData.set("documentUrl", documentUrl);

            // Call server action
            await addConsent(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setUploading(false);
        }
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-5 border border-slate-100 dark:border-slate-600 mb-6">
            <h4 className="font-medium text-sm text-[#143A82] dark:text-white mb-3">Upload New Consent</h4>
            <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="driverId" value={driverId} />

                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="type" className="text-xs">Consent Type</Label>
                        <select
                            id="type"
                            name="type"
                            className="mt-1 flex h-9 w-full rounded-md border border-[#77C7EC]/40 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-sm text-[#143A82] dark:text-white shadow-sm"
                        >
                            <option value="LIMITED">Limited (General)</option>
                            <option value="FULL">Full (Pre-Employment)</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="validUntil" className="text-xs">Valid Until (Optional)</Label>
                        <Input id="validUntil" name="validUntil" type="date" className="mt-1 h-9" />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <Label className="text-xs mb-1.5 block">Consent PDF (Optional)</Label>
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
                            ${file
                                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                                : "border-slate-200 dark:border-slate-600 hover:border-[#3E91DE] dark:hover:border-[#3E91DE] bg-white dark:bg-slate-800"
                            }`}
                        onClick={() => fileRef.current?.click()}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    if (f.type !== "application/pdf") {
                                        setError("Only PDF files are allowed");
                                        return;
                                    }
                                    if (f.size > 5 * 1024 * 1024) {
                                        setError("File must be under 5MB");
                                        return;
                                    }
                                    setError(null);
                                    setFile(f);
                                }
                            }}
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-2">
                                <FileCheck className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{file.name}</span>
                                <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                                    className="ml-2 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <Upload className="w-6 h-6 text-slate-400" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Click to upload consent PDF</span>
                                <span className="text-xs text-slate-400">PDF only, max 5MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}

                <Button type="submit" size="sm" className="h-9" disabled={uploading}>
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        "Add Consent"
                    )}
                </Button>
            </form>
        </div>
    );
}
