"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendBuyQueriesEmail, sendUpdateRosterEmail } from "@/lib/email-service"

export async function createCompany(formData: FormData) {
    const name = formData.get("name") as string
    const dotNumber = formData.get("dotNumber") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const queryBalanceStr = formData.get("queryBalance") as string
    const queryBalance = queryBalanceStr ? parseInt(queryBalanceStr, 10) : 0

    if (!name) {
        throw new Error("Company name is required")
    }

    const company = await prisma.company.create({
        data: {
            name,
            dotNumber: dotNumber || null,
            email: email || null,
            phone: phone || null,
            queryBalance,
        },
    })

    revalidatePath("/companies")
    revalidatePath("/")
    redirect(`/companies/${company.id}`)
}

export async function updateCompany(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const dotNumber = formData.get("dotNumber") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const queryBalanceStr = formData.get("queryBalance") as string

    if (!id || !name) throw new Error("Missing ID or Company Name");

    const updateData: any = { name, dotNumber, email, phone };
    if (queryBalanceStr !== null && queryBalanceStr !== undefined && queryBalanceStr !== "") {
        updateData.queryBalance = parseInt(queryBalanceStr, 10);
    }

    await prisma.company.update({
        where: { id },
        data: updateData
    });

    revalidatePath("/companies")
    revalidatePath(`/companies/${id}`)
    redirect(`/companies/${id}`)
}

export async function logBulkCompanyQueries(formData: FormData) {
    const companyId = formData.get("companyId") as string
    const queryDateStr = formData.get("queryDate") as string
    const updateDrivers = formData.get("updateDrivers") !== null

    if (!companyId || !queryDateStr) throw new Error("Missing fields");

    const queryDate = new Date(queryDateStr);
    const nextDueDate = new Date(queryDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    await prisma.$transaction(async (tx) => {
        if (updateDrivers) {
            const drivers = await tx.driver.findMany({
                where: { companyId }
            });

            await tx.driver.updateMany({
                where: { companyId },
                data: {
                    lastQueryDate: queryDate,
                    nextQueryDueDate: nextDueDate
                }
            });

            await tx.company.update({
                where: { id: companyId },
                data: {
                    queryBalance: { decrement: drivers.length },
                    lastBulkQueryDate: queryDate,
                    nextBulkQueryDueDate: nextDueDate
                }
            });

            for (const driver of drivers) {
                await tx.query.create({
                    data: {
                        companyId,
                        driverId: driver.id,
                        type: "LIMITED",
                        status: "ELIGIBLE",
                        queryDate
                    }
                });
            }
        } else {
            await tx.company.update({
                where: { id: companyId },
                data: {
                    updatedAt: new Date(),
                    lastBulkQueryDate: queryDate,
                    nextBulkQueryDueDate: nextDueDate
                } // Touch to update UI at least if checkbox wasn't checked
            });
        }
    });

    revalidatePath("/companies")
    revalidatePath(`/companies/${companyId}`)
    revalidatePath("/drivers")
    revalidatePath("/queries")
    redirect(`/companies/${companyId}`)
}

export async function sendBuyQueriesReminder(companyId: string) {
    if (!companyId) throw new Error("Missing company ID");

    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, email: true }
    });

    if (!company) throw new Error("Company not found");
    if (!company.email) return { success: false, message: "Company does not have an email address on file." };

    return await sendBuyQueriesEmail(company.name, company.email);
}

export async function sendUpdateRosterReminder(companyId: string) {
    if (!companyId) throw new Error("Missing company ID");

    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, email: true }
    });

    if (!company) throw new Error("Company not found");
    if (!company.email) return { success: false, message: "Company does not have an email address on file." };

    return await sendUpdateRosterEmail(company.name, company.email);
}

export async function scheduleReminder(
    companyId: string,
    type: "buy-queries" | "update-roster",
    scheduleType: "date" | "10-days" | "clear",
    date?: string
) {
    if (!companyId) throw new Error("Missing company ID");

    const updateData: any = {};

    if (scheduleType === "clear") {
        if (type === "buy-queries") updateData.autoSendBuyQueriesDate = null;
        if (type === "update-roster") updateData.autoSendUpdateRosterDate = null;
    } else if (scheduleType === "10-days") {
        updateData.autoSend10DaysBefore = true;
    } else if (scheduleType === "date" && date) {
        if (type === "buy-queries") updateData.autoSendBuyQueriesDate = new Date(date);
        if (type === "update-roster") updateData.autoSendUpdateRosterDate = new Date(date);
    }

    try {
        await prisma.company.update({
            where: { id: companyId },
            data: updateData
        });
        revalidatePath(`/companies/${companyId}`);
        return { success: true, message: "Reminder scheduled successfully." };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Failed to schedule reminder." };
    }
}

export async function updateBulkQueryDate(companyId: string, formData: FormData) {
    const dateStr = formData.get("date") as string;
    if (!companyId || !dateStr) throw new Error("Missing required fields");

    const date = new Date(dateStr);
    const nextDueDate = new Date(date);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    await prisma.company.update({
        where: { id: companyId },
        data: {
            lastBulkQueryDate: date,
            nextBulkQueryDueDate: nextDueDate
        }
    });

    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/companies");
}

export async function deleteCompany(id: string) {
    if (!id) throw new Error("Missing company ID");

    await prisma.company.delete({
        where: { id }
    });

    revalidatePath("/companies")
    revalidatePath("/")
    redirect("/companies")
}
