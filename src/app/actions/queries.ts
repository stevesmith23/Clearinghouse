"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendProhibitedAlert } from "@/lib/email-service"

export async function createQuery(formData: FormData) {
    const driverId = formData.get("driverId") as string
    const type = formData.get("type") as string // LIMITED or FULL
    const status = formData.get("status") as string // PROHIBITED or ELIGIBLE

    if (!driverId || !type || !status) {
        throw new Error("Missing required fields")
    }

    // Look up driver to get companyId and email
    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        select: {
            companyId: true,
            firstName: true,
            lastName: true,
            company: { select: { name: true, email: true, additionalEmails: true } }
        }
    })

    if (!driver) throw new Error("Driver not found")
    const companyId = driver.companyId

    // Transaction to create query, update company balance, and update driver dates
    await prisma.$transaction(async (tx) => {
        // 1. Create the query
        await tx.query.create({
            data: {
                companyId,
                driverId,
                type,
                status,
                queryDate: new Date(),
            }
        })

        // 2. Deduct company balance
        await tx.company.update({
            where: { id: companyId },
            data: { queryBalance: { decrement: 1 } }
        })

        // 3. Update driver dates
        const nextDueDate = new Date()
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)

        await tx.driver.update({
            where: { id: driverId },
            data: {
                lastQueryDate: new Date(),
                nextQueryDueDate: nextDueDate
            }
        })

        // 4. Violation automatically created if PROHIBITED
        if (status === "PROHIBITED") {
            await tx.violation.create({
                data: {
                    driverId,
                    violationDate: new Date(),
                    violationType: type === "FULL" ? "PRE_EMPLOYMENT_PROHIBITED" : "ANNUAL_QUERY_PROHIBITED",
                    reportedBy: "FMCSA Clearinghouse - Manual Entry",
                    status: "PENDING_RTD"
                }
            })

            // Dispatch email alerts — include full query reminder if it was a LIMITED query
            const fullName = `${driver.firstName} ${driver.lastName}`;
            const allEmails = [driver.company.email, ...(driver.company.additionalEmails?.split(",") || [])].filter(Boolean) as string[];
            const requiresFullQuery = type === "LIMITED";

            sendProhibitedAlert(fullName, driver.company.name, allEmails.join(","), requiresFullQuery).catch(err => {
                console.error("Failed to trigger prohibited alert pipeline:", err);
            });
        }
    })

    revalidatePath("/queries")
    revalidatePath(`/companies/${companyId}`)
    revalidatePath(`/drivers/${driverId}`)
    redirect("/queries")
}

