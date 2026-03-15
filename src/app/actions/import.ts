"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

interface CompanyRow {
    name: string;
    dotNumber: string;
    email: string;
    phone: string;
}

export async function importCompaniesFromCSV(rows: CompanyRow[]) {
    if (!rows || rows.length === 0) {
        return { success: false, message: "No data to import." };
    }

    try {
        let created = 0;
        let skipped = 0;

        for (const row of rows) {
            if (!row.name.trim()) {
                skipped++;
                continue;
            }

            // Check for duplicate by name
            const existing = await prisma.company.findFirst({
                where: { name: { equals: row.name.trim() } }
            });

            if (existing) {
                skipped++;
                continue;
            }

            await prisma.company.create({
                data: {
                    name: row.name.trim(),
                    dotNumber: row.dotNumber?.trim() || null,
                    email: row.email?.trim().toLowerCase() || null,
                    phone: row.phone?.trim() || null,
                    queryBalance: 0,
                }
            });
            created++;
        }

        revalidatePath("/companies");
        revalidatePath("/");
        return {
            success: true,
            message: `Successfully imported ${created} companies.${skipped > 0 ? ` ${skipped} skipped (duplicates or empty).` : ""}`
        };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, message: "Failed to import companies. Check console for details." };
    }
}
