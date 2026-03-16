"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getSettings() {
    let settings = await prisma.systemSettings.findUnique({
        where: { id: "default" }
    });

    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: { id: "default", notificationEmail: "" }
        });
    }

    return settings;
}

export async function updateSettings(formData: FormData) {
    const notificationEmail = formData.get("notificationEmail") as string;

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { notificationEmail },
        create: { id: "default", notificationEmail }
    });

    revalidatePath("/settings");
}

export async function updateReminderThresholds(formData: FormData) {
    const consentDays = parseInt(formData.get("consentExpiryWarningDays") as string) || 30;
    const bulkDays = parseInt(formData.get("bulkQueryWarningDays") as string) || 30;

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { consentExpiryWarningDays: consentDays, bulkQueryWarningDays: bulkDays },
        create: { id: "default", consentExpiryWarningDays: consentDays, bulkQueryWarningDays: bulkDays }
    });

    revalidatePath("/settings");
}

export async function updateLowBalanceThreshold(formData: FormData) {
    const threshold = parseInt(formData.get("lowBalanceThreshold") as string) || 5;

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { lowBalanceThreshold: threshold },
        create: { id: "default", lowBalanceThreshold: threshold }
    });

    revalidatePath("/settings");
}

export async function updateSmtpConfig(formData: FormData) {
    const smtpHost = formData.get("smtpHost") as string || null;
    const smtpPort = parseInt(formData.get("smtpPort") as string) || null;
    const smtpUser = formData.get("smtpUser") as string || null;
    const smtpPass = formData.get("smtpPass") as string || null;
    const smtpFromEmail = formData.get("smtpFromEmail") as string || null;
    const smtpFromName = formData.get("smtpFromName") as string || null;

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { smtpHost, smtpPort, smtpUser, smtpPass, smtpFromEmail, smtpFromName },
        create: { id: "default", smtpHost, smtpPort, smtpUser, smtpPass, smtpFromEmail, smtpFromName }
    });

    revalidatePath("/settings");
}

export async function updatePasswordPolicy(formData: FormData) {
    const passwordMinLength = parseInt(formData.get("passwordMinLength") as string) || 8;
    const passwordRequireUppercase = formData.get("passwordRequireUppercase") === "on";
    const passwordRequireNumber = formData.get("passwordRequireNumber") === "on";
    const passwordRequireSpecial = formData.get("passwordRequireSpecial") === "on";

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { passwordMinLength, passwordRequireUppercase, passwordRequireNumber, passwordRequireSpecial },
        create: { id: "default", passwordMinLength, passwordRequireUppercase, passwordRequireNumber, passwordRequireSpecial }
    });

    revalidatePath("/settings");
}

export async function getSessionHistory() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lastLoginAt: true,
            lastLoginIp: true,
        },
        orderBy: { lastLoginAt: "desc" },
    });

    const recentAttempts = await prisma.loginAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return { users, recentAttempts };
}
