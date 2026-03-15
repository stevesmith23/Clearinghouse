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
        {
            name: "Company.additionalEmails",
            sql: `ALTER TABLE "Company" ADD COLUMN "additionalEmails" TEXT`,
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
