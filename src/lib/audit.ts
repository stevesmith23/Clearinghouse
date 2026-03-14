"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAudit(
    userId: string,
    userName: string,
    action: string,
    target?: string,
    details?: string
) {
    try {
        const headersList = await headers();
        const ipAddress =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "unknown";

        await prisma.auditLog.create({
            data: {
                userId,
                userName,
                action,
                target,
                details,
                ipAddress,
            },
        });
    } catch (e) {
        // Don't let audit logging failures break the app
        console.error("Audit log failed:", e);
    }
}
