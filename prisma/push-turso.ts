// Push schema to Turso - run with: npx tsx prisma/push-turso.ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

if (!url || !authToken) {
    console.error("Set DATABASE_URL and TURSO_AUTH_TOKEN env vars first.");
    process.exit(1);
}

const client = createClient({ url, authToken });

// SQLite CREATE TABLE statements matching the Prisma schema
const tables = [
    `CREATE TABLE IF NOT EXISTS "Company" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "dotNumber" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "queryBalance" INTEGER NOT NULL DEFAULT 0,
        "lastBulkQueryDate" DATETIME,
        "nextBulkQueryDueDate" DATETIME,
        "autoSendBuyQueriesDate" DATETIME,
        "autoSendUpdateRosterDate" DATETIME,
        "autoSend10DaysBefore" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Driver" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "cdlNumber" TEXT NOT NULL,
        "cdlState" TEXT NOT NULL,
        "dob" DATETIME,
        "companyId" TEXT NOT NULL,
        "lastQueryDate" DATETIME,
        "nextQueryDueDate" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Consent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "driverId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "validUntil" DATETIME,
        "documentUrl" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Consent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Query" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        "driverId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "queryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "result" TEXT,
        "documentUrl" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Query_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Query_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Violation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "driverId" TEXT NOT NULL,
        "violationDate" DATETIME NOT NULL,
        "violationType" TEXT NOT NULL,
        "reportedBy" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Violation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "FollowUpTest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "violationId" TEXT NOT NULL,
        "dueDate" DATETIME NOT NULL,
        "status" TEXT NOT NULL,
        "result" TEXT,
        "completedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "FollowUpTest_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "SystemSettings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        "notificationEmail" TEXT,
        "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'VIEWER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "userName" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "target" TEXT,
        "details" TEXT,
        "ipAddress" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "LoginAttempt" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "success" BOOLEAN NOT NULL,
        "ipAddress" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
];

async function main() {
    console.log("Pushing schema to Turso...");
    console.log(`URL: ${url}`);

    for (const sql of tables) {
        const tableName = sql.match(/"(\w+)"/)?.[1] || "index";
        try {
            await client.execute(sql);
            console.log(`  ✓ ${tableName}`);
        } catch (e: any) {
            console.error(`  ✗ ${tableName}: ${e.message}`);
        }
    }

    console.log("\nSchema push complete!");
}

main()
    .catch((e) => {
        console.error("Failed:", e);
        process.exit(1);
    });
