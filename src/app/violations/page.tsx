import { prisma } from "@/lib/prisma"
import { ShieldAlert, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import RTDTimeline from "./RTDTimeline"

export const dynamic = 'force-dynamic';

export default async function ViolationsPage() {
    const violations = await prisma.violation.findMany({
        orderBy: { violationDate: 'desc' },
        include: {
            driver: { select: { firstName: true, lastName: true, id: true, cdlNumber: true } }
        }
    })

    const activeCount = violations.filter(v => v.status === "PENDING_RTD").length;
    const rtdEligibleCount = violations.filter(v => v.status === "RTD_ELIGIBLE").length;
    const clearedCount = violations.filter(v => v.status === "CLEARED").length;
    const totalCount = violations.length;

    // Serialize dates for client component
    const serializedViolations = violations.map(v => ({
        ...v,
        violationDate: v.violationDate.toISOString(),
        removedFromDutyDate: v.removedFromDutyDate?.toISOString() || null,
        sapInitialEvalDate: v.sapInitialEvalDate?.toISOString() || null,
        treatmentCompletedDate: v.treatmentCompletedDate?.toISOString() || null,
        sapFollowUpEvalDate: v.sapFollowUpEvalDate?.toISOString() || null,
        rtdTestDate: v.rtdTestDate?.toISOString() || null,
        rtdTestResult: v.rtdTestResult || null,
        clearedDate: v.clearedDate?.toISOString() || null,
        sapName: v.sapName || null,
        sapPhone: v.sapPhone || null,
        sapEmail: v.sapEmail || null,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
    }));

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-[#3E91DE] dark:text-[#77C7EC]" />
                        Violations & RTD Tracking
                    </h1>
                    <p className="text-[#3E91DE] dark:text-slate-400 mt-1">Monitor prohibited drivers and track their Return-to-Duty progress step by step.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Pending RTD</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{activeCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">RTD Eligible</span>
                    </div>
                    <p className="text-3xl font-bold text-indigo-700">{rtdEligibleCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Cleared</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">{clearedCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-[#3E91DE]" />
                        <span className="text-xs font-semibold text-[#3E91DE] uppercase tracking-wide">All-Time Total</span>
                    </div>
                    <p className="text-3xl font-bold text-[#143A82] dark:text-white">{totalCount}</p>
                </div>
            </div>

            {/* Violations List with RTD Timelines */}
            <div className="space-y-4">
                {serializedViolations.length === 0 ? (
                    <div className="text-center py-16 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                        <ShieldAlert className="w-12 h-12 text-[#77C7EC] mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-[#143A82] dark:text-white">No Violations Found</h3>
                        <p className="text-[#3E91DE]/70 text-sm mt-1">That's a good thing! When a prohibited query result is logged, violations will appear here with full RTD tracking.</p>
                    </div>
                ) : (
                    serializedViolations.map((violation) => (
                        <RTDTimeline key={violation.id} violation={violation} />
                    ))
                )}
            </div>
        </div>
    )
}
