"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendProhibitedAlert } from "@/lib/email-service"

export async function createQuery(formData: FormData) {
    const driverId = formData.get("driverId") as string
    const type = formData.get("type") as string // LIMITED or FULL
    const status = formData.get("status") as string // PENDING, COMPLETED, PROHIBITED, ELIGIBLE
    const documentUrl = formData.get("documentUrl") as string | null // Optional PDF Link

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
            company: { select: { name: true, email: true } }
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
                documentUrl: documentUrl ? documentUrl : null,
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
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1) // Annual queries due in 1 year

        await tx.driver.update({
            where: { id: driverId },
            data: {
                lastQueryDate: new Date(),
                nextQueryDueDate: nextDueDate
            }
        })

        // 4. violation automatically created if PROHIBITED
        if (status === "PROHIBITED") {
            await tx.violation.create({
                data: {
                    driverId,
                    violationDate: new Date(),
                    violationType: type === "FULL" ? "PRE_EMPLOYMENT_PROHIBITED" : "ANNUAL_QUERY_PROHIBITED",
                    reportedBy: "FMCSA ClearinghouseGroup - Manual Entry",
                    status: "PENDING_RTD"
                }
            })
            // Dispatch async email alerts
            const fullName = `${driver.firstName} ${driver.lastName}`;
            sendProhibitedAlert(fullName, driver.company.name, driver.company.email).catch(err => {
                console.error("Failed to trigger prohibited alert pipeline:", err);
            });
        }
    })

    revalidatePath("/queries")
    revalidatePath(`/companies/${companyId}`)
    revalidatePath(`/drivers/${driverId}`)
    redirect("/queries")
}
