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

        // Convert date strings to Date objects
        if (data.removedFromDutyDate) updateData.removedFromDutyDate = new Date(data.removedFromDutyDate);
        if (data.sapInitialEvalDate) updateData.sapInitialEvalDate = new Date(data.sapInitialEvalDate);
        if (data.treatmentCompletedDate) updateData.treatmentCompletedDate = new Date(data.treatmentCompletedDate);
        if (data.sapFollowUpEvalDate) updateData.sapFollowUpEvalDate = new Date(data.sapFollowUpEvalDate);
        if (data.rtdTestDate) updateData.rtdTestDate = new Date(data.rtdTestDate);
        if (data.clearedDate) updateData.clearedDate = new Date(data.clearedDate);

        // ── POSITIVE RTD TEST: Reset the entire process ──
        // Driver failed the RTD test — they must start treatment over
        if (data.rtdTestResult === "POSITIVE") {
            updateData.rtdTestResult = "POSITIVE";
            updateData.rtdTestDate = data.rtdTestDate ? new Date(data.rtdTestDate) : new Date();
            // Reset all milestones after "Removed from Duty" — they keep that date
            updateData.sapInitialEvalDate = null;
            updateData.treatmentCompletedDate = null;
            updateData.sapFollowUpEvalDate = null;
            updateData.clearedDate = null;
            // Status stays PENDING_RTD — they're still prohibited
            updateData.status = "PENDING_RTD";
        }
        // ── NEGATIVE RTD TEST + CLEARED DATE: RTD Complete ──
        else if (data.clearedDate && data.rtdTestResult === "NEGATIVE") {
            updateData.rtdTestResult = "NEGATIVE";
            updateData.status = "CLEARED";
        }
        // ── NEGATIVE RTD TEST (no cleared date yet): Eligible ──
        else if (data.rtdTestDate && data.rtdTestResult === "NEGATIVE") {
            updateData.rtdTestResult = "NEGATIVE";
            updateData.status = "RTD_ELIGIBLE";
        }
        // ── CLEARED DATE entered (with existing negative result) ──
        else if (data.clearedDate) {
            // Check the existing violation to see if RTD test was negative
            const existing = await prisma.violation.findUnique({ where: { id: violationId } });
            if (existing?.rtdTestResult === "NEGATIVE") {
                updateData.status = "CLEARED";
            }
        }
        // ── Manual status override ──
        else if (data.status) {
            updateData.status = data.status;
        }

        await prisma.violation.update({
            where: { id: violationId },
            data: updateData,
        });

        revalidatePath("/violations");
        revalidatePath("/alerts");
        revalidatePath("/");
        return { success: true, wasPositive: data.rtdTestResult === "POSITIVE" };
    } catch (error) {
        console.error("Failed to update violation RTD:", error);
        return { success: false, error: "Failed to update RTD information" };
    }
}
