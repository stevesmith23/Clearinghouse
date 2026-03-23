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
        include: {
            drivers: {
                orderBy: { lastName: 'asc' },
                include: {
                    consents: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 },
                    queries: { orderBy: { queryDate: 'desc' }, take: 5 },
                    violations: { orderBy: { violationDate: 'desc' } },
                }
            }
        }
    });

    if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const totalDrivers = company.drivers.length;
    const driversWithConsent = company.drivers.filter(d => d.consents.length > 0).length;
    const consentPercent = totalDrivers > 0 ? Math.round((driversWithConsent / totalDrivers) * 100) : 0;
    const violationCount = company.drivers.reduce((sum, d) => sum + d.violations.length, 0);
    const activeViolations = company.drivers.reduce((sum, d) => sum + d.violations.filter(v => v.status !== 'CLEARED').length, 0);

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DOT Audit Report — ${company.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; margin: auto; }
        h1 { color: #143A82; font-size: 24px; border-bottom: 3px solid #3E91DE; padding-bottom: 10px; margin-bottom: 5px; }
        h2 { color: #3E91DE; font-size: 16px; margin: 25px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
        .summary-card .value { font-size: 28px; font-weight: bold; color: #143A82; }
        .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .info-item { font-size: 13px; }
        .info-item strong { color: #143A82; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
        tr:hover { background: #fafbfc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 20px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom:20px; text-align:right;">
        <button onclick="window.print()" style="padding:8px 20px; background:#3E91DE; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">Print / Save as PDF</button>
    </div>

    <h1>DOT Compliance Audit Report</h1>
    <p class="subtitle">Generated: ${today} | ClearinghouseGroup TPA Management</p>

    <h2>Company Information</h2>
    <div class="info-grid">
        <div class="info-item"><strong>Company Name:</strong> ${company.name}</div>
        <div class="info-item"><strong>DOT Number:</strong> ${company.dotNumber || 'N/A'}</div>
        <div class="info-item"><strong>Email:</strong> ${company.email || 'N/A'}</div>
        <div class="info-item"><strong>Phone:</strong> ${company.phone || 'N/A'}</div>
        <div class="info-item"><strong>Address:</strong> ${[company.address, company.city, company.state, company.zip].filter(Boolean).join(', ') || 'N/A'}</div>
        <div class="info-item"><strong>Clearinghouse Registered:</strong> ${company.clearinghouseRegistered ? 'Yes' : 'No'}</div>
        <div class="info-item"><strong>C/TPA Designated:</strong> ${company.ctpaDesignated ? 'Yes' : 'No'}</div>
        <div class="info-item"><strong>Last Bulk Query:</strong> ${company.lastBulkQueryDate ? new Date(company.lastBulkQueryDate).toLocaleDateString() : 'Never'}</div>
    </div>

    <div class="summary">
        <div class="summary-card"><div class="value">${totalDrivers}</div><div class="label">Total Drivers</div></div>
        <div class="summary-card"><div class="value">${consentPercent}%</div><div class="label">Consent Coverage</div></div>
        <div class="summary-card"><div class="value">${company.queryBalance}</div><div class="label">Query Credits</div></div>
        <div class="summary-card"><div class="value" style="color:${activeViolations > 0 ? '#dc2626' : '#16a34a'}">${activeViolations}</div><div class="label">Active Violations</div></div>
    </div>

    <h2>Driver Roster & Consent Status</h2>
    <table>
        <thead><tr><th>Driver Name</th><th>CDL Number</th><th>CDL State</th><th>Consent Status</th><th>Consent Expiry</th></tr></thead>
        <tbody>
            ${company.drivers.map(d => {
                const consent = d.consents[0];
                return `<tr>
                    <td><strong>${d.lastName}, ${d.firstName}</strong></td>
                    <td>${d.cdlNumber}</td>
                    <td>${d.cdlState}</td>
                    <td>${consent ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">Missing</span>'}</td>
                    <td>${consent?.validUntil ? new Date(consent.validUntil).toLocaleDateString() : '—'}</td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>

    ${violationCount > 0 ? `
    <h2>Violation & RTD History</h2>
    <table>
        <thead><tr><th>Driver</th><th>Date</th><th>Type</th><th>Status</th><th>Cleared Date</th></tr></thead>
        <tbody>
            ${company.drivers.flatMap(d => d.violations.map(v => `<tr>
                <td>${d.lastName}, ${d.firstName}</td>
                <td>${new Date(v.violationDate).toLocaleDateString()}</td>
                <td>${v.violationType.replace(/_/g, ' ')}</td>
                <td><span class="badge ${v.status === 'CLEARED' ? 'badge-green' : v.status === 'PENDING_RTD' ? 'badge-red' : 'badge-amber'}">${v.status.replace(/_/g, ' ')}</span></td>
                <td>${v.clearedDate ? new Date(v.clearedDate).toLocaleDateString() : '—'}</td>
            </tr>`)).join('')}
        </tbody>
    </table>
    ` : ''}

    <h2>Query History (Last 5 per Driver)</h2>
    <table>
        <thead><tr><th>Driver</th><th>Query Date</th><th>Type</th><th>Status</th></tr></thead>
        <tbody>
            ${company.drivers.flatMap(d => d.queries.map(q => `<tr>
                <td>${d.lastName}, ${d.firstName}</td>
                <td>${new Date(q.queryDate).toLocaleDateString()}</td>
                <td>${q.type}</td>
                <td><span class="badge ${q.status === 'ELIGIBLE' ? 'badge-green' : q.status === 'PROHIBITED' ? 'badge-red' : 'badge-amber'}">${q.status}</span></td>
            </tr>`)).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No queries on record</td></tr>'}
        </tbody>
    </table>

    <div class="footer">
        ClearinghouseGroup TPA Management System — Confidential Compliance Document — Generated ${today}
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
