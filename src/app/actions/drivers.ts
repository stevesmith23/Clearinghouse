"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function createDriver(formData: FormData) {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const cdlNumber = formData.get("cdlNumber") as string
    const cdlState = formData.get("cdlState") as string
    const companyId = formData.get("companyId") as string
    const dobString = formData.get("dob") as string

    if (!firstName || !lastName || !cdlNumber || !cdlState || !companyId) {
        throw new Error("Missing required fields")
    }

    const dob = dobString ? new Date(dobString) : null

    const driver = await prisma.driver.create({
        data: {
            firstName,
            lastName,
            cdlNumber,
            cdlState,
            companyId,
            dob,
        },
    })

    revalidatePath("/drivers")
    revalidatePath(`/companies/${companyId}`)
    redirect(`/drivers/${driver.id}`)
}

export async function addConsent(formData: FormData) {
    const driverId = formData.get("driverId") as string
    const type = formData.get("type") as string
    const validUntilString = formData.get("validUntil") as string

    if (!driverId || !type) throw new Error("Missing fields")

    const validUntil = validUntilString ? new Date(validUntilString) : null

    // Expire prior active consents before adding a new one
    await prisma.consent.updateMany({
        where: { driverId, status: "ACTIVE" },
        data: { status: "EXPIRED" }
    })

    await prisma.consent.create({
        data: {
            driverId,
            type,
            status: "ACTIVE",
            validUntil,
        }
    })

    revalidatePath(`/drivers/${driverId}`)
}

export async function revokeConsent(consentId: string, driverId: string) {
    await prisma.consent.update({
        where: { id: consentId },
        data: { status: "REVOKED" }
    })
    revalidatePath(`/drivers/${driverId}`)
}

export async function updateDriver(driverId: string, formData: FormData) {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const cdlNumber = formData.get("cdlNumber") as string
    const cdlState = formData.get("cdlState") as string
    const dobString = formData.get("dob") as string

    if (!firstName || !lastName || !cdlNumber || !cdlState) {
        throw new Error("Missing required fields")
    }

    const dob = dobString ? new Date(dobString) : null

    const driver = await prisma.driver.update({
        where: { id: driverId },
        data: { firstName, lastName, cdlNumber, cdlState, dob },
    })

    revalidatePath(`/drivers/${driverId}`)
    revalidatePath(`/companies/${driver.companyId}`)
    revalidatePath("/drivers")
    redirect(`/drivers/${driverId}`)
}

export async function deleteDriver(id: string) {
    if (!id) throw new Error("Missing driver ID")

    const driver = await prisma.driver.delete({
        where: { id }
    })

    revalidatePath("/drivers")
    revalidatePath(`/companies/${driver.companyId}`)
    redirect(`/companies/${driver.companyId}`)
}

export async function transferDriver(driverId: string, newCompanyId: string) {
    if (!driverId || !newCompanyId) throw new Error("Missing required fields")

    const driver = await prisma.driver.findUnique({ where: { id: driverId } })
    if (!driver) throw new Error("Driver not found")

    const oldCompanyId = driver.companyId

    await prisma.driver.update({
        where: { id: driverId },
        data: { companyId: newCompanyId },
    })

    revalidatePath("/drivers")
    revalidatePath(`/companies/${oldCompanyId}`)
    revalidatePath(`/companies/${newCompanyId}`)
    revalidatePath(`/drivers/${driverId}`)

    return { success: true }
}
