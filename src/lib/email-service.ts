import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendProhibitedAlert(driverName: string, companyName: string, employerEmail: string | null) {
    const internalEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"Clearinghouse System" <noreply@clearinghousegroup.com>';

    if (!internalEmail) {
        console.error("Missing NOTIFICATION_EMAIL for internal alerts.");
        return;
    }

    try {
        // 1. Send Internal Alert
        const internalHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
                <h2 style="color: #dc2626; margin-bottom: 20px;">CRITICAL: Prohibited Driver Logged</h2>
                <p><strong>A clearinghouse query just returned a PROHIBITED status.</strong></p>
                <ul style="background-color: #fef2f2; padding: 15px 15px 15px 35px; border-radius: 5px;">
                    <li><strong>Driver:</strong> ${driverName}</li>
                    <li><strong>Company:</strong> ${companyName}</li>
                </ul>
                <p style="margin-top: 20px;">The system has automatically generated a violation record for this driver. They must immediately be pulled from safety-sensitive functions.</p>
                <p>Please log into the admin dashboard to review the driver's profile and begin tracking the RTD progression.</p>
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
            const employerHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #143A82; max-width: 600px; line-height: 1.5;">
                    <h2 style="color: #143A82; border-bottom: 2px solid #3E91DE; padding-bottom: 10px;">IMPORTANT CLEARINGHOUSE NOTICE</h2>
                    <p>Dear ${companyName},</p>
                    <p>You are receiving this notice because an FMCSA Drug & Alcohol Clearinghouse query conducted on your behalf by ClearinghouseGroup has returned a status of <strong><span style="color: #dc2626;">PROHIBITED</span></strong> for <strong>${driverName}</strong>.</p>
                    
                    <h3 style="color: #dc2626;">What does "Prohibited" mean?</h3>
                    <p>A "Prohibited" status means that this driver has a recorded drug or alcohol violation in the FMCSA Clearinghouse (such as a positive test result or a refusal to test) and has <strong>not</strong> completed the required Return-to-Duty (RTD) process.</p>
                    
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
                <p>We use your current driver roster in the <strong>i3</strong> system to determine which drivers need to be queried.</p>
                
                <h3 style="color: #3E91DE;">Please complete the following step:</h3>
                <div style="margin-bottom: 15px;">
                    <strong>Update your i3 Roster:</strong><br>
                    Please review and update your active driver roster in the i3 system Immediately. Ensure any newly hired drivers are added, and any terminated drivers are removed.
                </div>
                
                <p>We must have an accurate roster in i3 before we run the annual queries to maintain your compliance.</p>
                
                <p>Thank you.</p>
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
            subject: `Action Required: Update i3 Roster for ${companyName}`,
            html: html,
        });

        return { success: true, message: "Update Roster email sent successfully." };
    } catch (error) {
        console.error("Failed to dispatch Update Roster reminder:", error);
        return { success: false, message: "Failed to send the email due to a server error." };
    }
}
