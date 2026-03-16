import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const query = `%${q}%`;

    try {
        const [companies, drivers, queries] = await Promise.all([
            prisma.company.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { dotNumber: { contains: q } },
                        { email: { contains: q } },
                    ],
                },
                select: { id: true, name: true, dotNumber: true },
                take: 5,
            }),
            prisma.driver.findMany({
                where: {
                    OR: [
                        { firstName: { contains: q } },
                        { lastName: { contains: q } },
                        { cdlNumber: { contains: q } },
                    ],
                },
                select: { id: true, firstName: true, lastName: true, cdlNumber: true, company: { select: { name: true } } },
                take: 5,
            }),
            prisma.query.findMany({
                where: {
                    OR: [
                        { driver: { firstName: { contains: q } } },
                        { driver: { lastName: { contains: q } } },
                        { company: { name: { contains: q } } },
                    ],
                },
                select: {
                    id: true, type: true, status: true, queryDate: true,
                    driver: { select: { firstName: true, lastName: true } },
                    company: { select: { name: true } },
                },
                take: 5,
                orderBy: { queryDate: "desc" },
            }),
        ]);

        const results = [
            ...companies.map((c) => ({
                type: "company" as const,
                id: c.id,
                title: c.name,
                subtitle: c.dotNumber ? `DOT# ${c.dotNumber}` : "No DOT#",
                href: `/companies/${c.id}`,
            })),
            ...drivers.map((d) => ({
                type: "driver" as const,
                id: d.id,
                title: `${d.firstName} ${d.lastName}`,
                subtitle: `CDL: ${d.cdlNumber} · ${d.company.name}`,
                href: `/drivers/${d.id}`,
            })),
            ...queries.map((q) => ({
                type: "query" as const,
                id: q.id,
                title: `${q.type} Query — ${q.driver.firstName} ${q.driver.lastName}`,
                subtitle: `${q.company.name} · ${q.status} · ${new Date(q.queryDate).toLocaleDateString()}`,
                href: `/queries`,
            })),
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ results: [] });
    }
}
