"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateViolationRTD(violationId: string, data: {
    sapName?: string;
    sapPhone?: string;
    sapEmail?: string;
    removedFromDutyDate?: string;
    sapInitialEvalDate?: string;
    treatmentCompletedDate?: string;
    sapFollowUpEvalDate?: string;
    rtdTestDate?: string;
    rtdTestResult?: string;
    clearedDate?: string;
    notes?: string;
    status?: string;
}) {
    try {
        const updateData: any = {};

        if (data.sapName !== undefined) updateData.sapName = data.sapName;
        if (data.sapPhone !== undefined) updateData.sapPhone = data.sapPhone;
        if (data.sapEmail !== undefined) updateData.sapEmail = data.sapEmail;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.rtdTestResult !== undefined) updateData.rtdTestResult = data.rtdTestResult;

        // Convert date strings to Date objects
        if (data.removedFromDutyDate) updateData.removedFromDutyDate = new Date(data.removedFromDutyDate);
        if (data.sapInitialEvalDate) updateData.sapInitialEvalDate = new Date(data.sapInitialEvalDate);
        if (data.treatmentCompletedDate) updateData.treatmentCompletedDate = new Date(data.treatmentCompletedDate);
        if (data.sapFollowUpEvalDate) updateData.sapFollowUpEvalDate = new Date(data.sapFollowUpEvalDate);
        if (data.rtdTestDate) updateData.rtdTestDate = new Date(data.rtdTestDate);
        if (data.clearedDate) updateData.clearedDate = new Date(data.clearedDate);

        // Auto-update status based on milestones
        if (data.clearedDate) {
            updateData.status = "CLEARED";
        } else if (data.rtdTestDate && data.rtdTestResult === "NEGATIVE") {
            updateData.status = "RTD_ELIGIBLE";
        } else if (data.status) {
            updateData.status = data.status;
        }

        await prisma.violation.update({
            where: { id: violationId },
            data: updateData,
        });

        revalidatePath("/violations");
        revalidatePath("/alerts");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to update violation RTD:", error);
        return { success: false, error: "Failed to update RTD information" };
    }
}
