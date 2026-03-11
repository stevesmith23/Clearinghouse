import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Mark as dynamic so it always hits the DB directly
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Basic auth check to prevent unauthorized external triggers
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Find companies with a bulk query due date that is ON or BEFORE 30 days from now
        const expiringCompanies = await prisma.company.findMany({
            where: {
                nextBulkQueryDueDate: { lte: thirtyDaysFromNow }
            },
            orderBy: { nextBulkQueryDueDate: 'asc' }
        });

        if (expiringCompanies.length === 0) {
            return NextResponse.json({ message: "No companies require bulk query notifications at this time." });
        }

        // Configure Nodemailer transporter via environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 1. Fetch the system settings from the database
        const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });

        // 2. Determine target email (DB -> ENV(NOTIFICATION_EMAIL) -> ENV(SMTP_USER))
        const targetEmail = settings?.notificationEmail || process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;

        if (!targetEmail) {
            console.warn("Notifications skipped. No target email found in Settings or .env");
            return NextResponse.json({ message: "Notifications skipped. Missing email config." }, { status: 400 });
        }

        // Build HTML email body
        let htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #143A82; max-width: 600px;">
                <h2 style="color: #3E91DE; border-bottom: 2px solid #77C7EC; padding-bottom: 10px;">ClearinghouseGroup - Action Required</h2>
                <p>The following companies have Annual Bulk Queries approaching their 365-day deadline (due within the next 30 days or past due):</p>
                <ul style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #77C7EC;">
        `;

        expiringCompanies.forEach(company => {
            const dueDate = company.nextBulkQueryDueDate ? company.nextBulkQueryDueDate.toLocaleDateString() : 'Unknown';
            const isPastDue = company.nextBulkQueryDueDate && company.nextBulkQueryDueDate < new Date();

            htmlBody += `<li style="margin-bottom: 10px;">
                <strong>${company.name}</strong> - 
                <span style="color: ${isPastDue ? '#dc2626' : '#d97706'}; font-weight: bold;">
                    ${isPastDue ? 'PAST DUE (' + dueDate + ')' : 'Due: ' + dueDate}
                </span>
            </li>`;
        });

        htmlBody += `
                </ul>
                <p style="margin-top: 20px;">Please log into the ClearinghouseGroup dashboard to run the partial queries and update their records.</p>
                <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This is an automated message from your internal TPA notification system.</p>
            </div>
        `;

        // Dispatch the email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'notifications@clearinghousegroup.com',
            to: targetEmail,
            subject: `Action Needed: ${expiringCompanies.length} Clearinghouse Bulk Queries Due`,
            html: htmlBody
        });

        return NextResponse.json({
            message: `Successfully sent email notifications.`,
            companiesNotifiedCount: expiringCompanies.length,
            targetEmail
        });

    } catch (error: any) {
        console.error("Cron notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
