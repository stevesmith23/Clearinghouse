import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return new NextResponse("Company ID is required", { status: 400 });
    }

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { drivers: true }
        });

        if (!company) {
            return new NextResponse("Company not found", { status: 404 });
        }

        // FMCSA Bulk Upload Template format requires tab-delimited or comma-separated.
        // The standard columns for a partial/limited query are:
        // First Name | Last Name | Date of Birth | CDL Number | State of Issuance | Country of Issuance 

        let tsvContent = "First Name\tLast Name\tDate of Birth\tCDL Number\tState of Issuance\tCountry of Issuance\n";

        company.drivers.forEach(driver => {
            const firstName = driver.firstName.trim();
            const lastName = driver.lastName.trim();

            // Format DOB as MM/DD/YYYY as commonly requested
            const dob = driver.dob
                ? `${(driver.dob.getMonth() + 1).toString().padStart(2, '0')}/${driver.dob.getDate().toString().padStart(2, '0')}/${driver.dob.getFullYear()}`
                : "";

            const cdl = driver.cdlNumber.trim();
            const state = driver.cdlState.trim().toUpperCase();
            const country = "US"; // Assuming US for now based on standard State inputs

            tsvContent += `${firstName}\t${lastName}\t${dob}\t${cdl}\t${state}\t${country}\n`;
        });

        // Set headers to trigger file download in browser
        const response = new NextResponse(tsvContent);
        response.headers.set('Content-Type', 'text/tab-separated-values');
        response.headers.set('Content-Disposition', `attachment; filename="${company.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_fmcsa_bulk_query.tsv"`);

        return response;

    } catch (error) {
        console.error("Failed to generate bulk export:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
