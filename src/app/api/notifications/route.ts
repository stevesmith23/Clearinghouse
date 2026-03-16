import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
    const notifications: Array<{
        id: string;
        type: "warning" | "danger" | "info";
        title: string;
        message: string;
        href: string;
        time: string;
    }> = [];

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    try {
        // Active violations (PENDING_RTD)
        const activeViolations = await prisma.violation.findMany({
            where: { status: "PENDING_RTD" },
            include: { driver: { select: { firstName: true, lastName: true } } },
            orderBy: { violationDate: "desc" },
            take: 5,
        });

        for (const v of activeViolations) {
            notifications.push({
                id: `viol-${v.id}`,
                type: "danger",
                title: `Prohibited Driver: ${v.driver.firstName} ${v.driver.lastName}`,
                message: `${v.violationType.replace(/_/g, " ")} — Pending RTD process`,
                href: "/violations",
                time: `${differenceInDays(now, v.violationDate)} days ago`,
            });
        }

        // Expiring consents (within 30 days)
        const expiringConsents = await prisma.consent.findMany({
            where: {
                status: "ACTIVE",
                validUntil: { lte: thirtyDays, gte: now },
            },
            include: { driver: { select: { firstName: true, lastName: true } } },
            orderBy: { validUntil: "asc" },
            take: 5,
        });

        for (const c of expiringConsents) {
            const days = c.validUntil ? differenceInDays(c.validUntil, now) : 0;
            notifications.push({
                id: `consent-${c.id}`,
                type: "warning",
                title: `Consent Expiring: ${c.driver.firstName} ${c.driver.lastName}`,
                message: `Expires in ${days} days`,
                href: "/consents",
                time: `Due ${c.validUntil?.toLocaleDateString()}`,
            });
        }

        // Bulk queries due soon
        const bulkDue = await prisma.company.findMany({
            where: { nextBulkQueryDueDate: { lte: thirtyDays, gte: now } },
            select: { id: true, name: true, nextBulkQueryDueDate: true },
            take: 5,
        });

        for (const co of bulkDue) {
            const days = co.nextBulkQueryDueDate ? differenceInDays(co.nextBulkQueryDueDate, now) : 0;
            notifications.push({
                id: `bulk-${co.id}`,
                type: "warning",
                title: `Bulk Query Due: ${co.name}`,
                message: `Annual queries due in ${days} days`,
                href: `/companies/${co.id}`,
                time: `Due ${co.nextBulkQueryDueDate?.toLocaleDateString()}`,
            });
        }

        // Query plan shortfalls
        const companies = await prisma.company.findMany({
            select: { id: true, name: true, queryBalance: true, _count: { select: { drivers: true } } },
        });

        const shortfall = companies.filter((c) => c.queryBalance < c._count.drivers).slice(0, 3);
        for (const co of shortfall) {
            notifications.push({
                id: `shortfall-${co.id}`,
                type: "info",
                title: `Low Query Balance: ${co.name}`,
                message: `${co.queryBalance} credits, ${co._count.drivers} drivers need queries`,
                href: `/companies/${co.id}`,
                time: "Action needed",
            });
        }

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ notifications: [] });
    }
}
