"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";

export function ExportForm() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        if (!startDate || !endDate) return;
        setIsExporting(true);

        const url = `/api/export/billing?startDate=${startDate}&endDate=${endDate}`;
        window.open(url, '_blank');

        setTimeout(() => setIsExporting(false), 2000); // Reset UI after launch
    };

    const setPresetDates = (preset: 'currentMonth' | 'lastMonth' | 'ytd') => {
        const today = new Date();
        let start, end;

        if (preset === 'currentMonth') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'lastMonth') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else {
            // YTD
            start = new Date(today.getFullYear(), 0, 1);
            end = today;
        }

        // Format to YYYY-MM-DD for the input fields
        const formatDate = (date: Date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setPresetDates('currentMonth')}
                    className="px-3 py-1.5 text-xs font-medium bg-[#77C7EC]/10 text-[#143A82] hover:bg-[#77C7EC]/20 border border-[#77C7EC]/30 rounded-md transition-colors"
                >
                    Current Month
                </button>
                <button
                    onClick={() => setPresetDates('lastMonth')}
                    className="px-3 py-1.5 text-xs font-medium bg-[#77C7EC]/10 text-[#143A82] hover:bg-[#77C7EC]/20 border border-[#77C7EC]/30 rounded-md transition-colors"
                >
                    Last Month
                </button>
                <button
                    onClick={() => setPresetDates('ytd')}
                    className="px-3 py-1.5 text-xs font-medium bg-[#77C7EC]/10 text-[#143A82] hover:bg-[#77C7EC]/20 border border-[#77C7EC]/30 rounded-md transition-colors"
                >
                    Year to Date
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#3E91DE]" /> Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent text-[#143A82] shadow-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#3E91DE]" /> End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent text-[#143A82] shadow-sm"
                    />
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={!startDate || !endDate || isExporting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#143A82] text-white rounded-lg font-medium hover:bg-[#143A82]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4" />
                {isExporting ? "Generating..." : "Download Excel CSV"}
            </button>
        </div>
    );
}
