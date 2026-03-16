import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendProhibitedAlert(driverName: string, companyName: string, employerEmail: string | null, requiresFullQuery: boolean = false) {
    const internalEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    if (!internalEmail) {
        console.error("Missing NOTIFICATION_EMAIL for internal alerts.");
        return;
    }

    try {
        // 1. Send Internal Alert
        const fullQueryNote = requiresFullQuery
            ? `<li><strong style="color: #dc2626;">⚠️ This was a LIMITED query — a FULL query must now be conducted on this driver.</strong></li>`
            : '';

        const internalHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
                <h2 style="color: #dc2626; margin-bottom: 20px;">CRITICAL: Prohibited Driver Logged</h2>
                <p><strong>A clearinghouse query just returned a PROHIBITED status.</strong></p>
                <ul style="background-color: #fef2f2; padding: 15px 15px 15px 35px; border-radius: 5px;">
                    <li><strong>Driver:</strong> ${driverName}</li>
                    <li><strong>Company:</strong> ${companyName}</li>
                    ${fullQueryNote}
                </ul>
                <p style="margin-top: 20px;">The system has automatically generated a violation record for this driver. They must immediately be pulled from safety-sensitive functions.</p>
                <p>Review the driver's profile on the dashboard to track the RTD progression. The employer's Designated Employer Representative (DER) will be notified separately.</p>
            </div>
        `;

        await transporter.sendMail({
            from: fromAddress,
            to: internalEmail,
            subject: `URGENT ALERT: Prohibited Driver (${driverName} - ${companyName})`,
            html: internalHtml,
        });

        // 2. Send Employer Notification (if email exists)
        if (employerEmail) {
            const fullQueryWarning = requiresFullQuery
                ? `<div style="background-color: #fefce8; padding: 15px; border-left: 4px solid #eab308; margin: 20px 0;">
                     <p style="margin: 0; font-size: 14px; color: #854d0e;"><strong>⚠️ FULL QUERY REQUIRED:</strong> Because this driver was found Prohibited through a <em>Limited (annual) query</em>, federal regulations require that a <strong>Full Query</strong> must now be conducted on this driver. <strong>ClearinghouseGroup will conduct the Full Query on your behalf and report the results to your Designated Employer Representative (DER).</strong></p>
                   </div>`
                : '';

            const employerHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.5;">
                    <h2 style="color: #143A82; border-bottom: 2px solid #3E91DE; padding-bottom: 10px;">IMPORTANT CLEARINGHOUSE NOTICE</h2>
                    <p>Dear ${companyName},</p>
                    <p>You are receiving this notice because an FMCSA Drug & Alcohol Clearinghouse query conducted on your behalf by ClearinghouseGroup has returned a status of <strong><span style="color: #dc2626;">PROHIBITED</span></strong> for <strong>${driverName}</strong>.</p>
                    
                    <h3 style="color: #dc2626;">What does "Prohibited" mean?</h3>
                    <p>A "Prohibited" status means that this driver has a recorded drug or alcohol violation in the FMCSA Clearinghouse (such as a positive test result or a refusal to test) and has <strong>not</strong> completed the required Return-to-Duty (RTD) process.</p>
                    
                    ${fullQueryWarning}
                    
                    <h3 style="color: #dc2626;">IMMEDIATE ACTION REQUIRED</h3>
                    <p>Under federal regulations (49 CFR Part 382.501), you must <strong>immediately remove ${driverName} from all safety-sensitive functions</strong>, which includes operating a Commercial Motor Vehicle (CMV).</p>
                    
                    <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong><em>WARNING:</em></strong> <em>Allowing a prohibited driver to perform safety-sensitive functions is a direct violation of FMCSA regulations and can result in severe fines. State Driver Licensing Agencies (SDLAs) are also mandated to downgrade the CDL of prohibited drivers.</em></p>
                    </div>
                    
                    <p>If you have questions regarding this notice or need assistance managing the RTD process, please contact us immediately.</p>
                    
                    <p style="margin-top: 30px;">
                        Sincerely,<br>
                        <strong>The Compliance Team</strong><br>
                        ClearinghouseGroup
                    </p>
                </div>
            `;

            await transporter.sendMail({
                from: fromAddress,
                to: employerEmail,
                subject: `URGENT ACTION REQUIRED: FMCSA Prohibited Result for ${driverName}`,
                html: employerHtml,
            });
            console.log(`Dispatched SAP notice to employer: ${employerEmail}`);
        } else {
            console.warn(`No email found for company ${companyName}. Employer SAP notification skipped.`);
        }

    } catch (error) {
        console.error("Failed to dispatch prohibited alerts:", error);
    }
}

export async function sendBuyQueriesEmail(companyName: string, employerEmail: string | null) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    if (!employerEmail) {
        return { success: false, message: "No email address found for this company." };
    }

    try {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.5;">
                <h2 style="color: #143A82; border-bottom: 2px solid #77C7EC; padding-bottom: 10px;">Action Required: Purchase FMCSA Query Plans</h2>
                <p>Dear ${companyName},</p>
                <p>It is time for ClearinghouseGroup to process your annual FMCSA Drug & Alcohol Clearinghouse queries.</p>
                <p>Before we can proceed, you need to ensure you have a sufficient query plan balance.</p>
                
                <h3 style="color: #3E91DE;">Please complete the following step:</h3>
                <div style="margin-bottom: 15px;">
                    <strong>Verify & Purchase Query Plans:</strong><br>
                    Log into your employer portal at <a href="https://clearinghouse.fmcsa.dot.gov" style="color: #3E91DE;">clearinghouse.fmcsa.dot.gov</a> and ensure you have purchased enough query plans to cover all of your active CDL drivers. <em>(As your TPA, we cannot purchase these on your behalf).</em>
                </div>
                
                <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3E91DE; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Need help?</strong> Download the official <a href="https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Purchase-Query-Plan.pdf" style="color: #3E91DE; font-weight: bold;">FMCSA Purchase Query Plan Brochure</a> for step-by-step instructions.</p>
                </div>
                
                <p>Thank you for your prompt attention to this matter.</p>
                <p style="margin-top: 30px;">
                    Sincerely,<br>
                    <strong>The Compliance Team</strong><br>
                    ClearinghouseGroup
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: fromAddress,
            to: employerEmail,
            subject: `Action Required: Purchase FMCSA Query Plans for ${companyName}`,
            html: html,
        });

        return { success: true, message: "Buy Queries email sent successfully." };
    } catch (error) {
        console.error("Failed to dispatch Buy Queries reminder:", error);
        return { success: false, message: "Failed to send the email due to a server error." };
    }
}

export async function sendUpdateRosterEmail(companyName: string, employerEmail: string | null) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    if (!employerEmail) {
        return { success: false, message: "No email address found for this company." };
    }

    try {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.5;">
                <h2 style="color: #143A82; border-bottom: 2px solid #77C7EC; padding-bottom: 10px;">Action Required: Update Driver Roster</h2>
                <p>Dear ${companyName},</p>
                <p>We are preparing to run your annual FMCSA Clearinghouse queries.</p>
                <p><strong>To ensure accuracy, we need your current driver roster.</strong> We use this roster to determine which drivers need to be queried in the FMCSA Clearinghouse. An outdated roster can result in missed queries or unnecessary charges.</p>
                
                <h3 style="color: #3E91DE;">What you need to do:</h3>
                <ol style="line-height: 1.8;">
                    <li><strong>Download the attached roster template(s)</strong> that apply to your company.</li>
                    <li><strong>Fill in your current active drivers</strong> — add any new hires and remove any terminated drivers.</li>
                    <li><strong>Email the completed roster back to us</strong> as soon as possible.</li>
                </ol>
                
                <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #3E91DE; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>📎 Roster templates are attached to this email.</strong> Please use the template that matches your company's testing program (FMCSA DOT, Non-FMCSA DOT, or Non-DOT).</p>
                </div>
                
                <p>We must have an accurate roster before we can run the annual queries to maintain your compliance.</p>
                
                <p>Thank you for your prompt attention.</p>
                <p style="margin-top: 30px;">
                    Sincerely,<br>
                    <strong>The Compliance Team</strong><br>
                    ClearinghouseGroup
                </p>
            </div>
        `;

        // Attach roster template files
        const sheetsDir = path.join(process.cwd(), 'sheets');
        const attachments: { filename: string; path: string }[] = [];

        try {
            if (fs.existsSync(sheetsDir)) {
                const files = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls') || f.endsWith('.csv'));
                for (const file of files) {
                    attachments.push({
                        filename: file,
                        path: path.join(sheetsDir, file),
                    });
                }
            }
        } catch (attachErr) {
            console.warn("Could not load roster attachments:", attachErr);
        }

        await transporter.sendMail({
            from: fromAddress,
            to: employerEmail,
            subject: `Action Required: Update Driver Roster for ${companyName}`,
            html: html,
            attachments,
        });

        return { success: true, message: "Update Roster email sent successfully." };
    } catch (error) {
        console.error("Failed to dispatch Update Roster reminder:", error);
        return { success: false, message: "Failed to send the email due to a server error." };
    }
}

export async function sendConsentRequestEmail(driverName: string, companyName: string, employerEmail: string, consentType: string = "LIMITED") {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    try {
        const typeLabel = consentType === "FULL" ? "Full (Pre-Employment)" : "Limited (Annual)";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.6;">
                <h2 style="color: #143A82; border-bottom: 2px solid #3E91DE; padding-bottom: 10px;">Driver Consent Request</h2>
                <p>Dear ${companyName},</p>
                <p>ClearinghouseGroup is requesting electronic consent from the following driver to conduct a <strong>${typeLabel}</strong> query on the FMCSA Drug & Alcohol Clearinghouse:</p>
                <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Driver:</strong> ${driverName}</p>
                    <p style="margin: 5px 0;"><strong>Query Type:</strong> ${typeLabel}</p>
                </div>
                <p>The driver must log into the Clearinghouse and provide electronic consent for this query. Please notify the driver that their consent is required.</p>
                <div style="background-color: #fefce8; padding: 15px; border-left: 4px solid #eab308; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #854d0e;"><strong>⚠️ IMPORTANT:</strong> If a driver <strong>refuses to provide consent</strong>, they are <strong>prohibited from performing safety-sensitive functions</strong> (including operating a CMV) for the requesting employer, per 49 CFR Part 382.</p>
                </div>
                <p>If the driver needs assistance with the consent process, they can visit: <a href="https://clearinghouse.fmcsa.dot.gov/Learn/Driver" style="color: #3E91DE;">FMCSA Clearinghouse Driver Resources</a></p>
                <p style="margin-top: 30px;">
                    Sincerely,<br>
                    <strong>The Compliance Team</strong><br>
                    ClearinghouseGroup
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: fromAddress,
            to: employerEmail,
            subject: `Consent Required: FMCSA Clearinghouse Query for ${driverName}`,
            html,
        });

        return { success: true, message: "Consent request email sent." };
    } catch (error) {
        console.error("Failed to send consent request email:", error);
        return { success: false, message: "Failed to send consent request email." };
    }
}

export async function sendQueryPlanReminderEmail(companyName: string, employerEmail: string, balance: number, driverCount: number) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    try {
        const shortage = driverCount - balance;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.6;">
                <h2 style="color: #143A82; border-bottom: 2px solid #3E91DE; padding-bottom: 10px;">Query Plan Balance Alert</h2>
                <p>Dear ${companyName},</p>
                <p>Your FMCSA Clearinghouse query plan balance is running low. You currently have:</p>
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Query Credits Remaining:</strong> <span style="color: #dc2626; font-size: 18px;">${balance}</span></p>
                    <p style="margin: 5px 0;"><strong>Active Drivers:</strong> ${driverCount}</p>
                    <p style="margin: 5px 0;"><strong>Additional Credits Needed:</strong> <span style="color: #dc2626;">${shortage}</span></p>
                </div>
                <p>You will need at least <strong>${driverCount} query credits</strong> to complete your annual bulk query for all active drivers.</p>
                <div style="background-color: #fefce8; padding: 15px; border-left: 4px solid #eab308; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #854d0e;"><strong>⚠️ NOTE:</strong> As your C/TPA, ClearinghouseGroup <strong>cannot purchase query plans on your behalf</strong>. Only the employer can purchase query plans directly through the FMCSA Clearinghouse.</p>
                </div>
                <p>To purchase additional query credits, visit: <a href="https://clearinghouse.fmcsa.dot.gov" style="color: #3E91DE;">clearinghouse.fmcsa.dot.gov</a></p>
                <p>For step-by-step instructions: <a href="https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Purchase-Query-Plan.pdf" style="color: #3E91DE;">How to Purchase a Query Plan (PDF)</a></p>
                <p style="margin-top: 30px;">
                    Sincerely,<br>
                    <strong>The Compliance Team</strong><br>
                    ClearinghouseGroup
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: fromAddress,
            to: employerEmail,
            subject: `Action Required: Purchase Query Credits for ${companyName}`,
            html,
        });

        return { success: true, message: "Query plan reminder sent." };
    } catch (error) {
        console.error("Failed to send query plan reminder:", error);
        return { success: false, message: "Failed to send query plan reminder." };
    }
}
