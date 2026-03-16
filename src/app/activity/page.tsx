import { prisma } from "@/lib/prisma";
import { History, User, Building2, FileSearch, Shield, LogIn, Settings, Trash2, Plus, Eye } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const actionIcons: Record<string, any> = {
    LOGIN: LogIn,
    VIEW_DRIVER: Eye,
    EXPORT_DATA: FileSearch,
    CREATE_USER: Plus,
    DELETE_USER: Trash2,
    CREATE_COMPANY: Building2,
    CREATE_DRIVER: User,
    UPDATE_COMPANY: Settings,
    UPDATE_DRIVER: Settings,
    CREATE_QUERY: FileSearch,
    CREATE_VIOLATION: Shield,
};

const actionColors: Record<string, string> = {
    LOGIN: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    VIEW_DRIVER: "bg-slate-100 dark:bg-slate-800 text-slate-500",
    EXPORT_DATA: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    CREATE_USER: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    DELETE_USER: "bg-red-100 dark:bg-red-900/30 text-red-600",
    CREATE_COMPANY: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    CREATE_DRIVER: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    UPDATE_COMPANY: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    UPDATE_DRIVER: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    CREATE_QUERY: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    CREATE_VIOLATION: "bg-red-100 dark:bg-red-900/30 text-red-600",
};

export default async function ActivityPage() {
    await requireAuth();

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    // Group by date
    const grouped = logs.reduce((acc, log) => {
        const dateKey = format(new Date(log.createdAt), "MMMM d, yyyy");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {} as Record<string, typeof logs>);

    return (
        <div className="p-8 sm:p-12 max-w-4xl mx-auto mb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white flex items-center gap-3">
                    <History className="w-8 h-8 text-[#3E91DE]" />
                    Activity Log
                </h1>
                <p className="text-[#3E91DE] mt-1">Recent system activity and audit trail.</p>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 px-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700">
                    <History className="w-12 h-12 text-[#77C7EC] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[#143A82] dark:text-white">No Activity Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Activity will appear here as you use the system.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([date, entries]) => (
                        <div key={date}>
                            <h3 className="text-sm font-bold text-[#143A82] dark:text-slate-300 mb-4 sticky top-0 bg-slate-50 dark:bg-slate-950 py-2 z-10">{date}</h3>
                            <div className="space-y-0">
                                {entries.map((log, idx) => {
                                    const Icon = actionIcons[log.action] || History;
                                    const colorClass = actionColors[log.action] || "bg-slate-100 dark:bg-slate-800 text-slate-500";
                                    return (
                                        <div key={log.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                {idx < entries.length - 1 && (
                                                    <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 min-h-[2rem]" />
                                                )}
                                            </div>
                                            <div className="pb-6 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-[#143A82] dark:text-white">
                                                        {log.action.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {format(new Date(log.createdAt), "h:mm a")}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    <span className="font-medium text-[#3E91DE]">{log.userName}</span>
                                                    {log.target && <span> · {log.target}</span>}
                                                </p>
                                                {log.details && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{log.details}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
