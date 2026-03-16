import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// One-time schema migration endpoint
// DELETE THIS FILE after running once
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET && secret !== "migrate-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        return NextResponse.json({ error: "Missing DATABASE_URL or TURSO_AUTH_TOKEN" }, { status: 500 });
    }

    const client = createClient({ url, authToken });
    const results: string[] = [];

    const tables = [
        {
            name: "AuditLog",
            sql: `CREATE TABLE IF NOT EXISTS "AuditLog" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "userName" TEXT NOT NULL,
                "action" TEXT NOT NULL,
                "target" TEXT,
                "details" TEXT,
                "ipAddress" TEXT,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
        },
        {
            name: "LoginAttempt",
            sql: `CREATE TABLE IF NOT EXISTS "LoginAttempt" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "email" TEXT NOT NULL,
                "success" BOOLEAN NOT NULL,
                "ipAddress" TEXT,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
        },
        { name: "Company.additionalEmails", sql: `ALTER TABLE "Company" ADD COLUMN "additionalEmails" TEXT` },
        { name: "Company.clearinghouseRegistered", sql: `ALTER TABLE "Company" ADD COLUMN "clearinghouseRegistered" BOOLEAN DEFAULT 0` },
        { name: "Company.ctpaDesignated", sql: `ALTER TABLE "Company" ADD COLUMN "ctpaDesignated" BOOLEAN DEFAULT 0` },
        { name: "Company.registrationDate", sql: `ALTER TABLE "Company" ADD COLUMN "registrationDate" DATETIME` },
        { name: "Violation.sapName", sql: `ALTER TABLE "Violation" ADD COLUMN "sapName" TEXT` },
        { name: "Violation.sapPhone", sql: `ALTER TABLE "Violation" ADD COLUMN "sapPhone" TEXT` },
        { name: "Violation.sapEmail", sql: `ALTER TABLE "Violation" ADD COLUMN "sapEmail" TEXT` },
        { name: "Violation.removedFromDutyDate", sql: `ALTER TABLE "Violation" ADD COLUMN "removedFromDutyDate" DATETIME` },
        { name: "Violation.sapInitialEvalDate", sql: `ALTER TABLE "Violation" ADD COLUMN "sapInitialEvalDate" DATETIME` },
        { name: "Violation.treatmentCompletedDate", sql: `ALTER TABLE "Violation" ADD COLUMN "treatmentCompletedDate" DATETIME` },
        { name: "Violation.sapFollowUpEvalDate", sql: `ALTER TABLE "Violation" ADD COLUMN "sapFollowUpEvalDate" DATETIME` },
        { name: "Violation.rtdTestDate", sql: `ALTER TABLE "Violation" ADD COLUMN "rtdTestDate" DATETIME` },
        { name: "Violation.rtdTestResult", sql: `ALTER TABLE "Violation" ADD COLUMN "rtdTestResult" TEXT` },
        { name: "Violation.clearedDate", sql: `ALTER TABLE "Violation" ADD COLUMN "clearedDate" DATETIME` },
        // Settings fields
        { name: "SystemSettings.consentExpiryWarningDays", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "consentExpiryWarningDays" INTEGER DEFAULT 30` },
        { name: "SystemSettings.bulkQueryWarningDays", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "bulkQueryWarningDays" INTEGER DEFAULT 30` },
        { name: "SystemSettings.lowBalanceThreshold", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "lowBalanceThreshold" INTEGER DEFAULT 5` },
        { name: "SystemSettings.smtpHost", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpHost" TEXT` },
        { name: "SystemSettings.smtpPort", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpPort" INTEGER` },
        { name: "SystemSettings.smtpUser", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpUser" TEXT` },
        { name: "SystemSettings.smtpPass", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpPass" TEXT` },
        { name: "SystemSettings.smtpFromEmail", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpFromEmail" TEXT` },
        { name: "SystemSettings.smtpFromName", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "smtpFromName" TEXT` },
        { name: "SystemSettings.passwordMinLength", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "passwordMinLength" INTEGER DEFAULT 8` },
        { name: "SystemSettings.passwordRequireUppercase", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "passwordRequireUppercase" BOOLEAN DEFAULT 1` },
        { name: "SystemSettings.passwordRequireNumber", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "passwordRequireNumber" BOOLEAN DEFAULT 1` },
        { name: "SystemSettings.passwordRequireSpecial", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "passwordRequireSpecial" BOOLEAN DEFAULT 0` },
        { name: "SystemSettings.idleTimeoutMinutes", sql: `ALTER TABLE "SystemSettings" ADD COLUMN "idleTimeoutMinutes" INTEGER DEFAULT 15` },
        // User login tracking
        { name: "User.lastLoginAt", sql: `ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME` },
        { name: "User.lastLoginIp", sql: `ALTER TABLE "User" ADD COLUMN "lastLoginIp" TEXT` },
        // EmailTemplate table
        {
            name: "EmailTemplate",
            sql: `CREATE TABLE IF NOT EXISTS "EmailTemplate" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "slug" TEXT NOT NULL UNIQUE,
                "name" TEXT NOT NULL,
                "subject" TEXT NOT NULL,
                "body" TEXT NOT NULL,
                "description" TEXT,
                "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
        },
    ];

    for (const table of tables) {
        try {
            await client.execute(table.sql);
            results.push(`✓ ${table.name} created`);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push(`✗ ${table.name}: ${msg}`);
        }
    }

    return NextResponse.json({ results });
}
