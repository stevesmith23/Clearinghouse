"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

const DEFAULT_TEMPLATES = [
    {
        slug: "prohibited_alert",
        name: "Prohibited Driver Alert",
        subject: "CRITICAL: Prohibited Driver Logged — {{driverName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #dc2626;">CRITICAL: Prohibited Driver Logged</h2>
    <p><strong>A clearinghouse query just returned a PROHIBITED status.</strong></p>
    <ul style="background-color: #fef2f2; padding: 15px 15px 15px 35px; border-radius: 5px;">
        <li><strong>Driver:</strong> {{driverName}}</li>
        <li><strong>Company:</strong> {{companyName}}</li>
    </ul>
    <p>The system has automatically generated a violation record for this driver. They must immediately be pulled from safety-sensitive functions.</p>
    <p>Review the driver's profile on the dashboard to track the RTD progression.</p>
</div>`,
        description: "Sent internally when a query returns PROHIBITED",
    },
    {
        slug: "der_notification",
        name: "DER Notification",
        subject: "Clearinghouse Query Result — Action Required for {{driverName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #1e40af;">Clearinghouse Query Result Notification</h2>
    <p>A Clearinghouse query has been completed for a driver in your organization. <strong>Action is required from your Designated Employer Representative (DER).</strong></p>
    <ul style="background-color: #eff6ff; padding: 15px 15px 15px 35px; border-radius: 5px;">
        <li><strong>Driver:</strong> {{driverName}}</li>
        <li><strong>Company:</strong> {{companyName}}</li>
    </ul>
    <p>ClearinghouseGroup, your C/TPA, will conduct a full query on the driver and report the results to the DER. The driver must be removed from safety-sensitive functions until the Return-to-Duty process is complete.</p>
</div>`,
        description: "Sent to employer DER when a driver is prohibited",
    },
    {
        slug: "consent_request",
        name: "Consent Request",
        subject: "Driver Consent Required — {{driverName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #1e40af;">Driver Consent Required</h2>
    <p>A full query must be conducted on the following driver. Per 49 CFR Part 40/382, the driver must provide electronic consent through the FMCSA Clearinghouse before we can proceed.</p>
    <ul style="background-color: #eff6ff; padding: 15px 15px 15px 35px; border-radius: 5px;">
        <li><strong>Driver:</strong> {{driverName}}</li>
        <li><strong>Company:</strong> {{companyName}}</li>
    </ul>
    <p><strong>⚠️ Important:</strong> If the driver refuses to grant consent, they must be treated as PROHIBITED and immediately removed from safety-sensitive duties.</p>
    <p>Please have the driver log in to <a href="https://clearinghouse.fmcsa.dot.gov">clearinghouse.fmcsa.dot.gov</a> to grant consent.</p>
</div>`,
        description: "Asks employer to get driver consent via FMCSA",
    },
    {
        slug: "buy_queries_reminder",
        name: "Buy Queries Reminder",
        subject: "Query Credit Balance Low — {{companyName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #d97706;">Query Plan Balance Low</h2>
    <p>Your FMCSA Clearinghouse query balance is running low for {{companyName}}.</p>
    <ul style="background-color: #fffbeb; padding: 15px 15px 15px 35px; border-radius: 5px;">
        <li><strong>Current Balance:</strong> {{queryBalance}} queries remaining</li>
        <li><strong>Active Drivers:</strong> {{driverCount}}</li>
    </ul>
    <p><strong>Note:</strong> As your C/TPA, ClearinghouseGroup cannot purchase query plans on your behalf. Query plans must be purchased directly through the FMCSA Clearinghouse.</p>
    <p><a href="https://clearinghouse.fmcsa.dot.gov/Resource/Index/Query-Plan-Purchase">Purchase Query Plans →</a></p>
</div>`,
        description: "Reminds employer to buy more query credits",
    },
    {
        slug: "update_roster_reminder",
        name: "Update Roster Reminder",
        subject: "Driver Roster Update Needed — {{companyName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #1e40af;">Driver Roster Update Requested</h2>
    <p>Please send an updated driver roster for {{companyName}} so we can ensure all drivers are properly monitored in the FMCSA Clearinghouse.</p>
    <p>Please include for each driver:</p>
    <ul>
        <li>Full legal name</li>
        <li>Date of birth</li>
        <li>CDL number and state</li>
        <li>Phone number and email</li>
    </ul>
    <p>Reply to this email with the updated roster or send as a spreadsheet attachment.</p>
</div>`,
        description: "Asks employer to send updated driver roster",
    },
    {
        slug: "query_plan_reminder",
        name: "Query Plan Reminder",
        subject: "Annual Query Plan Reminder — {{companyName}}",
        body: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
    <h2 style="color: #1e40af;">Annual Query Plan Reminder</h2>
    <p>This is a reminder that {{companyName}} needs to purchase a query plan to cover annual pre-employment and random Clearinghouse queries.</p>
    <p>As your C/TPA, we cannot purchase query plans on your behalf. Plans must be purchased directly through the FMCSA Clearinghouse.</p>
    <p><a href="https://clearinghouse.fmcsa.dot.gov/Resource/Index/Query-Plan-Purchase">Purchase Query Plans →</a></p>
</div>`,
        description: "Annual reminder to purchase query plan",
    },
];

export async function getEmailTemplates() {
    let templates = await prisma.emailTemplate.findMany({
        orderBy: { slug: "asc" },
    });

    // Seed defaults if empty
    if (templates.length === 0) {
        for (const t of DEFAULT_TEMPLATES) {
            await prisma.emailTemplate.create({ data: t });
        }
        templates = await prisma.emailTemplate.findMany({
            orderBy: { slug: "asc" },
        });
    }

    return templates;
}

export async function updateEmailTemplate(formData: FormData) {
    const id = formData.get("id") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;

    await prisma.emailTemplate.update({
        where: { id },
        data: { subject, body },
    });

    revalidatePath("/settings");
}

export async function resetEmailTemplate(formData: FormData) {
    const slug = formData.get("slug") as string;
    const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.slug === slug);
    if (!defaultTemplate) return;

    await prisma.emailTemplate.update({
        where: { slug },
        data: { subject: defaultTemplate.subject, body: defaultTemplate.body },
    });

    revalidatePath("/settings");
}
