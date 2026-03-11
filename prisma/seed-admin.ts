// Seed script to create the initial admin user.
// Run with: npx tsx prisma/seed-admin.ts

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const email = "admin@clearinghousegroup.com";
    const password = "admin123"; // Change this in production!
    const name = "Admin";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            role: "ADMIN",
        },
    });

    console.log(`Admin user created successfully!`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Change this password after first login.`);
}

main()
    .catch((e) => {
        console.error("Failed to seed admin user:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
