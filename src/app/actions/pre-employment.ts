import { prisma } from "@/lib/prisma"

export async function getPreEmploymentDrivers() {
    // We need to find all drivers who do NOT have a successful FULL query logged.
    // A driver needs a Pre-Employment query if:
    // 1. They have NO queries at all OR
    // 2. They have queries, but NONE of them are type "FULL" with status "ELIGIBLE"

    try {
        const _drivers = await prisma.driver.findMany({
            include: {
                company: true,
                queries: {
                    select: {
                        type: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const pendingDrivers = _drivers.filter(driver => {
            // Check if they have ANY full eligible query
            const hasFullEligible = driver.queries.some(q => q.type === "FULL" && q.status === "ELIGIBLE");

            // If they do NOT have one, they need a pre-employment query
            return !hasFullEligible;
        });

        // Map to a cleaner format with a status indicator for the UI
        return pendingDrivers.map(d => {
            const hasPendingFull = d.queries.some(q => q.type === "FULL" && q.status === "PENDING");
            let status = "Needs FULL Query";
            if (hasPendingFull) status = "FULL Query Pending";

            return {
                id: d.id,
                firstName: d.firstName,
                lastName: d.lastName,
                cdlNumber: d.cdlNumber,
                companyName: d.company.name,
                companyId: d.company.id,
                dob: d.dob,
                status: status
            }
        });

    } catch (error) {
        console.error("Failed to fetch pre-employment drivers:", error);
        return [];
    }
}
