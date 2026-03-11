"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getSettings() {
    let settings = await prisma.systemSettings.findUnique({
        where: { id: "default" }
    });

    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: { id: "default", notificationEmail: "" }
        });
    }

    return settings;
}

export async function updateSettings(formData: FormData) {
    const notificationEmail = formData.get("notificationEmail") as string;

    await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { notificationEmail },
        create: { id: "default", notificationEmail }
    });

    revalidatePath("/settings");
}
