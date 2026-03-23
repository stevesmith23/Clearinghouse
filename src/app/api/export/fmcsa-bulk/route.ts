import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
        return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, dotNumber: true }
    });

    if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const drivers = await prisma.driver.findMany({
        where: { companyId },
        orderBy: { lastName: 'asc' },
        select: {
            lastName: true,
            firstName: true,
            dob: true,
            cdlNumber: true,
            cdlState: true,
        }
    });

    // FMCSA Bulk Upload format: Last Name, First Name, Date of Birth, CDL Number, CDL State
    const headers = ['Last Name', 'First Name', 'Date of Birth (MM/DD/YYYY)', 'CDL Number', 'CDL Issuing State'];
    const rows = drivers.map(d => [
        d.lastName,
        d.firstName,
        d.dob ? new Date(d.dob).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '',
        d.cdlNumber,
        d.cdlState,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');

    const safeName = company.name.replace(/[^a-zA-Z0-9]/g, '_');
    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="FMCSA_BulkQuery_${safeName}_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}
