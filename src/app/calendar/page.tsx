import { prisma } from "@/lib/prisma";
import { CalendarDays, AlertTriangle, ClipboardCheck, FileSearch, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, addWeeks } from "date-fns";

export const dynamic = "force-dynamic";

interface CalendarItem {
    id: string;
    type: "consent_expiring" | "bulk_query_due" | "follow_up_due" | "violation_pending";
    title: string;
    subtitle: string;
    date: Date;
    urgency: "overdue" | "urgent" | "upcoming" | "future";
    href: string;
}

export default async function CalendarPage() {
    await requireAuth();

    const now = new Date();
    const sixtyDaysOut = addDays(now, 60);

    const items: CalendarItem[] = [];

    // Expiring consents
    const expiringConsents = await prisma.consent.findMany({
        where: {
            status: "ACTIVE",
            validUntil: { lte: sixtyDaysOut },
        },
        include: { driver: { select: { firstName: true, lastName: true, company: { select: { name: true } } } } },
        orderBy: { validUntil: "asc" },
    });

    for (const c of expiringConsents) {
        if (!c.validUntil) continue;
        const days = differenceInDays(c.validUntil, now);
        items.push({
            id: `consent-${c.id}`,
            type: "consent_expiring",
            title: `${c.driver.firstName} ${c.driver.lastName}`,
            subtitle: `Consent expires — ${c.driver.company.name}`,
            date: c.validUntil,
            urgency: days < 0 ? "overdue" : days <= 7 ? "urgent" : days <= 30 ? "upcoming" : "future",
            href: "/consents",
        });
    }

    // Bulk queries due
    const bulkDue = await prisma.company.findMany({
        where: { nextBulkQueryDueDate: { lte: sixtyDaysOut } },
        select: { id: true, name: true, nextBulkQueryDueDate: true, _count: { select: { drivers: true } } },
    });

    for (const co of bulkDue) {
        if (!co.nextBulkQueryDueDate) continue;
        const days = differenceInDays(co.nextBulkQueryDueDate, now);
        items.push({
            id: `bulk-${co.id}`,
            type: "bulk_query_due",
            title: co.name,
            subtitle: `Bulk query due — ${co._count.drivers} drivers`,
            date: co.nextBulkQueryDueDate,
            urgency: days < 0 ? "overdue" : days <= 7 ? "urgent" : days <= 30 ? "upcoming" : "future",
            href: `/companies/${co.id}`,
        });
    }

    // Follow-up tests due
    const followUps = await prisma.followUpTest.findMany({
        where: { status: "PENDING", dueDate: { lte: sixtyDaysOut } },
        include: { violation: { include: { driver: { select: { firstName: true, lastName: true } } } } },
    });

    for (const f of followUps) {
        const days = differenceInDays(f.dueDate, now);
        items.push({
            id: `followup-${f.id}`,
            type: "follow_up_due",
            title: `${f.violation.driver.firstName} ${f.violation.driver.lastName}`,
            subtitle: "Follow-up test due",
            date: f.dueDate,
            urgency: days < 0 ? "overdue" : days <= 7 ? "urgent" : days <= 30 ? "upcoming" : "future",
            href: "/violations",
        });
    }

    // Pending violations
    const violations = await prisma.violation.findMany({
        where: { status: "PENDING_RTD" },
        include: { driver: { select: { firstName: true, lastName: true } } },
    });

    for (const v of violations) {
        items.push({
            id: `viol-${v.id}`,
            type: "violation_pending",
            title: `${v.driver.firstName} ${v.driver.lastName}`,
            subtitle: `RTD pending — ${v.violationType.replace(/_/g, " ")}`,
            date: v.violationDate,
            urgency: "overdue",
            href: "/violations",
        });
    }

    // Group by week
    const weeks: { label: string; start: Date; end: Date; items: CalendarItem[] }[] = [];

    // Overdue items (before today)
    const overdueItems = items.filter(i => i.urgency === "overdue");
    if (overdueItems.length > 0) {
        weeks.push({
            label: "⚠️ Overdue",
            start: new Date(0),
            end: now,
            items: overdueItems.sort((a, b) => a.date.getTime() - b.date.getTime()),
        });
    }

    // Generate 8 weeks forward
    for (let i = 0; i < 8; i++) {
        const weekStart = startOfWeek(addWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(addWeeks(now, i), { weekStartsOn: 1 });
        const weekItems = items.filter(
            (item) => item.urgency !== "overdue" && item.date >= weekStart && item.date <= weekEnd
        );
        if (weekItems.length > 0 || i < 4) {
            weeks.push({
                label: i === 0 ? "This Week" : i === 1 ? "Next Week" : format(weekStart, "MMM d") + " — " + format(weekEnd, "MMM d"),
                start: weekStart,
                end: weekEnd,
                items: weekItems.sort((a, b) => a.date.getTime() - b.date.getTime()),
            });
        }
    }

    const iconForType = (type: string) => {
        switch (type) {
            case "consent_expiring": return ClipboardCheck;
            case "bulk_query_due": return FileSearch;
            case "follow_up_due": return Clock;
            case "violation_pending": return ShieldAlert;
            default: return CalendarDays;
        }
    };

    const urgencyColors: Record<string, string> = {
        overdue: "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
        urgent: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
        upcoming: "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10",
        future: "border-l-slate-300 dark:border-l-slate-600 bg-white dark:bg-slate-900",
    };

    const urgencyBadges: Record<string, string> = {
        overdue: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
        urgent: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
        upcoming: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
        future: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    };

    const totalItems = items.length;
    const overdueCount = items.filter(i => i.urgency === "overdue").length;
    const urgentCount = items.filter(i => i.urgency === "urgent").length;

    return (
        <div className="p-8 sm:p-12 max-w-5xl mx-auto mb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-[#3E91DE]" />
                    Upcoming Deadlines
                </h1>
                <p className="text-[#3E91DE] mt-1">Expiring consents, bulk queries, follow-up tests, and pending violations over the next 8 weeks.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Overdue</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-400 mt-1">{overdueCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">This Week</p>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-400 mt-1">{urgentCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#3E91DE] uppercase tracking-wide">Total Upcoming</p>
                    <p className="text-3xl font-bold text-[#143A82] dark:text-white mt-1">{totalItems}</p>
                </div>
            </div>

            {/* Weekly timeline */}
            <div className="space-y-6">
                {weeks.map((week) => (
                    <div key={week.label}>
                        <h3 className="text-sm font-bold text-[#143A82] dark:text-slate-300 mb-3 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#3E91DE]" />
                            {week.label}
                            {week.items.length > 0 && (
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{week.items.length}</span>
                            )}
                        </h3>

                        {week.items.length === 0 ? (
                            <div className="text-sm text-slate-400 dark:text-slate-500 pl-6 py-2">Nothing scheduled</div>
                        ) : (
                            <div className="space-y-2">
                                {week.items.map((item) => {
                                    const Icon = iconForType(item.type);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={`block border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${urgencyColors[item.urgency]}`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-[#143A82] dark:text-white truncate">{item.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${urgencyBadges[item.urgency]}`}>
                                                        {item.urgency === "overdue" ? "Overdue" :
                                                            differenceInDays(item.date, now) === 0 ? "Today" :
                                                                differenceInDays(item.date, now) === 1 ? "Tomorrow" :
                                                                    format(item.date, "MMM d")}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
