import { FileSpreadsheet } from "lucide-react";
import { ExportForm } from "./ExportForm";

export const dynamic = 'force-dynamic';

export default function BillingPage() {
    return (
        <div className="p-8 sm:p-12 mb-20 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#77C7EC]/10 rounded-xl text-[#3E91DE]">
                        <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Billing & Exports</h1>
                        <p className="text-sm text-[#3E91DE] mt-1">Export query data for external invoicing.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#77C7EC]/20 shadow-sm overflow-hidden">
                    <div className="border-b border-sidebar-border/50 bg-slate-50/50 p-6">
                        <h2 className="font-semibold text-[#143A82]">Generate Invoice Spreadsheets</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Select a date range to download an Excel-ready CSV containing all Pre-Employment (Full) and Partial/Bulk (Limited) queries pulled during that period.
                        </p>
                    </div>

                    <div className="p-6">
                        <ExportForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
