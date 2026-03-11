import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBuyQueriesEmail, sendUpdateRosterEmail } from "@/lib/email-service";

// This tells Next.js to never cache this route, and always run it dynamically.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // In a real production app, verify a secret token in the header here 
    // to prevent unauthorized execution.
    // e.g., if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    // Calculate the target target timestamp for "10 days from now"
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    tenDaysFromNow.setHours(0, 0, 0, 0);

    let processedCount = 0;

    try {
        // 1. Find all Buy Queries automated emails due today
        const buyQueriesDue = await prisma.company.findMany({
            where: {
                OR: [
                    {
                        autoSendBuyQueriesDate: {
                            gte: today,
                            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                        }
                    },
                    {
                        autoSend10DaysBefore: true,
                        nextBulkQueryDueDate: {
                            gte: tenDaysFromNow,
                            lt: new Date(tenDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
                        }
                    }
                ],
                email: { not: null }
            }
        });

        for (const company of buyQueriesDue) {
            console.log(`[CRON] Dispatching Buy Queries reminder to ${company.name}`);
            await sendBuyQueriesEmail(company.name, company.email);
            processedCount++;

            // Nullify the specific date if it was used so it doesn't fire again tomorrow
            if (company.autoSendBuyQueriesDate) {
                await prisma.company.update({
                    where: { id: company.id },
                    data: { autoSendBuyQueriesDate: null }
                });
            }
        }

        // 2. Find all Update Roster automated emails due today
        const rosterDue = await prisma.company.findMany({
            where: {
                OR: [
                    {
                        autoSendUpdateRosterDate: {
                            gte: today,
                            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                        }
                    },
                    {
                        autoSend10DaysBefore: true,
                        nextBulkQueryDueDate: {
                            gte: tenDaysFromNow,
                            lt: new Date(tenDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
                        }
                    }
                ],
                email: { not: null }
            }
        });

        for (const company of rosterDue) {
            console.log(`[CRON] Dispatching Update Roster reminder to ${company.name}`);
            await sendUpdateRosterEmail(company.name, company.email);
            processedCount++;

            // Nullify the specific date if it was used
            if (company.autoSendUpdateRosterDate) {
                await prisma.company.update({
                    where: { id: company.id },
                    data: { autoSendUpdateRosterDate: null }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron completed. Processed ${processedCount} automated reminders.`,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error("[CRON ERROR]:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
