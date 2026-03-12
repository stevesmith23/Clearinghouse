import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const isProduction = process.env.NODE_ENV === 'production';
const url = process.env.DATABASE_URL || (isProduction ? undefined : "file:./dev.db");
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Set it to your Turso database URL (e.g. libsql://your-db.turso.io)"
    );
}

const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
})

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (!isProduction) globalForPrisma.prisma = prisma
