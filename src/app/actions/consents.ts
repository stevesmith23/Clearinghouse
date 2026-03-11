"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createConsent(formData: FormData) {
    const driverId = formData.get("driverId") as string;
    const type = formData.get("type") as string; // "LIMITED" or "FULL"
    const validUntilStr = formData.get("validUntil") as string;
    const documentUrl = formData.get("documentUrl") as string;

    const validUntil = new Date(validUntilStr);

    await prisma.consent.create({
        data: {
            driverId,
            type,
            status: "ACTIVE",
            validUntil,
            documentUrl: documentUrl || null,
        }
    });

    revalidatePath("/consents");
    revalidatePath("/drivers");
    redirect("/consents");
}
