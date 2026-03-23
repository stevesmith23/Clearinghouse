"use client";

import { useMemo } from "react";

type ChartProps = {
    consentStats: { active: number; expiring: number; missing: number };
    monthlyQueries: { month: string; count: number }[];
    companyCompliance: { name: string; percent: number }[];
};

function DonutChart({ active, expiring, missing }: { active: number; expiring: number; missing: number }) {
    const total = active + expiring + missing || 1;
    const activeP = (active / total) * 100;
    const expiringP = (expiring / total) * 100;

    // CSS conic-gradient donut
    const gradient = `conic-gradient(
        #10b981 0% ${activeP}%,
        #f59e0b ${activeP}% ${activeP + expiringP}%,
        #ef4444 ${activeP + expiringP}% 100%
    )`;

    return (
        <div className="flex items-center gap-6">
            <div
                className="w-28 h-28 rounded-full flex-shrink-0 relative"
                style={{
                    background: gradient,
                    WebkitMask: "radial-gradient(farthest-side, transparent 60%, #000 61%)",
                    mask: "radial-gradient(farthest-side, transparent 60%, #000 61%)",
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#143A82] dark:text-white">{total}</span>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600 dark:text-slate-300">Active: <strong className="text-[#143A82] dark:text-white">{active}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-600 dark:text-slate-300">Expiring: <strong className="text-[#143A82] dark:text-white">{expiring}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600 dark:text-slate-300">Missing: <strong className="text-[#143A82] dark:text-white">{missing}</strong></span>
                </div>
            </div>
        </div>
    );
}

function BarChart({ data }: { data: { month: string; count: number }[] }) {
    const max = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-[#143A82] dark:text-white">{d.count}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-[#3E91DE] to-[#77C7EC] transition-all duration-500"
                        style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                    ></div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

function ComplianceBars({ data }: { data: { name: string; percent: number }[] }) {
    return (
        <div className="space-y-3">
            {data.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No company data yet</p>
            ) : (
                data.map((c, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-[#143A82] dark:text-white truncate max-w-[150px]">{c.name}</span>
                            <span className={`font-bold ${c.percent >= 80 ? 'text-emerald-600' : c.percent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.percent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${c.percent >= 80 ? 'bg-emerald-500' : c.percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${c.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default function DashboardCharts({ consentStats, monthlyQueries, companyCompliance }: ChartProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Consent Coverage Donut */}
            <div className="bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[#3E91DE] dark:text-[#77C7EC] uppercase tracking-wider mb-4">Consent Coverage</h3>
                <DonutChart {...consentStats} />
            </div>

            {/* Monthly Queries Bar Chart */}
            <div className="bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[#3E91DE] dark:text-[#77C7EC] uppercase tracking-wider mb-4">Queries (Last 6 Months)</h3>
                <BarChart data={monthlyQueries} />
            </div>

            {/* Company Compliance Bars */}
            <div className="bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[#3E91DE] dark:text-[#77C7EC] uppercase tracking-wider mb-4">Company Consent Compliance</h3>
                <ComplianceBars data={companyCompliance} />
            </div>
        </div>
    );
}
