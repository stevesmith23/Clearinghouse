import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        if (!startDateParam || !endDateParam) {
            return new NextResponse("Start Date and End Date are required.", { status: 400 });
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        // Include the entire end day
        endDate.setHours(23, 59, 59, 999);

        const queries = await prisma.query.findMany({
            where: {
                queryDate: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            include: {
                company: true,
            },
            orderBy: {
                queryDate: 'asc'
            }
        });

        // Generate CSV mapping Full->Pre-Employment, Limited->Bulk
        let csvContent = 'Company Name,Query Type,Date Pulled\n';

        queries.forEach(query => {
            // Escape commas in company names by wrapping in quotes
            const safeCompanyName = query.company ? `"${query.company.name.replace(/"/g, '""')}"` : '"Unknown Company"';

            let queryType = "Unknown";
            if (query.type === "FULL") {
                queryType = "Pre-Employment";
            } else if (query.type === "LIMITED") {
                queryType = "Partial/Bulk";
            }

            const formattedDate = format(query.queryDate, 'MM/dd/yyyy');

            csvContent += `${safeCompanyName},${queryType},${formattedDate}\n`;
        });

        // Set headers for download
        const headers = new Headers();
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename="billing_export_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv"`);

        return new NextResponse(csvContent, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("Error generating billing CSV:", error);
        return new NextResponse("Failed to generate CSV", { status: 500 });
    }
}
