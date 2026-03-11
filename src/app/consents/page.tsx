import { prisma } from "@/lib/prisma";
import { ClipboardCheck, FileSearch, CheckCircle2, AlertTriangle, AlertCircle, Plus, Search, Building2 } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ConsentsPage() {
    const drivers = await prisma.driver.findMany({
        include: {
            company: true,
            consents: {
                where: {
                    type: 'LIMITED' // We primarily track annual General Consents
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        },
        orderBy: { lastName: "asc" }
    });

    const processedDrivers = drivers.map((driver) => {
        const latestConsent = driver.consents[0];
        let status = "MISSING";
        let daysUntilExpired = null;

        if (latestConsent?.validUntil) {
            daysUntilExpired = differenceInDays(new Date(latestConsent.validUntil), new Date());

            if (daysUntilExpired < 0) {
                status = "EXPIRED";
            } else if (daysUntilExpired <= 60) {
                status = "EXPIRING_SOON";
            } else {
                status = "VALID";
            }
        }

        return { ...driver, latestConsent, consentStatus: status, daysUntilExpired };
    });

    // Counts for summary metrics
    const missingCount = processedDrivers.filter(d => d.consentStatus === "MISSING").length;
    const expiredCount = processedDrivers.filter(d => d.consentStatus === "EXPIRED").length;
    const expiringSoonCount = processedDrivers.filter(d => d.consentStatus === "EXPIRING_SOON").length;
    const validCount = processedDrivers.filter(d => d.consentStatus === "VALID").length;

    return (
        <div className="p-8 sm:p-12 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82] flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-[#3E91DE]" />
                        Consents
                    </h1>
                    <p className="text-[#3E91DE] mt-1">Track and manage driver general consent forms for annual queries.</p>
                </div>
                <Link
                    href="/consents/new"
                    className="px-4 py-2 bg-[#3E91DE] hover:bg-[#143A82] text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Log New Consent
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-[#77C7EC]/20 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Missing Consents</p>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-800">{missingCount}</span>
                        {missingCount > 0 && <span className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Action Needed</span>}
                    </div>
                </div>
                <div className="bg-white border border-[#77C7EC]/20 border-l-4 border-l-red-500 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Expired</p>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-red-600">{expiredCount}</span>
                    </div>
                </div>
                <div className="bg-white border border-[#77C7EC]/20 border-l-4 border-l-amber-500 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Expiring soon (≤60 Days)</p>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-amber-600">{expiringSoonCount}</span>
                    </div>
                </div>
                <div className="bg-white border border-[#77C7EC]/20 border-l-4 border-l-emerald-500 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Valid (On File)</p>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-emerald-600">{validCount}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-[#77C7EC]/20 flex items-center bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
                    <div className="relative max-w-md w-full">
                        <Search className="w-4 h-4 text-[#77C7EC] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by driver name or company..."
                            className="w-full pl-9 pr-4 py-2 border border-[#77C7EC]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-[#3E91DE] border-b border-[#77C7EC]/20">
                                <th className="px-6 py-4 font-semibold">Driver Name</th>
                                <th className="px-6 py-4 font-semibold">Company</th>
                                <th className="px-6 py-4 font-semibold">Consent Status</th>
                                <th className="px-6 py-4 font-semibold">Valid Until</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#77C7EC]/10">
                            {processedDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#3E91DE]">
                                        <ClipboardCheck className="w-12 h-12 text-[#77C7EC] mx-auto mb-3 opacity-50" />
                                        <p className="text-[#143A82] font-medium text-sm">No drivers found</p>
                                        <p className="text-[#3E91DE]/70 text-xs mt-1 mb-4">You need to add drivers before tracking their consents.</p>
                                        <Link href="/drivers/new" className="text-[#3E91DE] hover:text-[#143A82] text-sm font-medium">
                                            + Add a Driver
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                processedDrivers.map((driver: any) => (
                                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#143A82]">{driver.firstName} {driver.lastName}</div>
                                            <div className="text-xs text-[#3E91DE] mt-0.5 uppercase">{driver.cdlState} - {driver.cdlNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-[#77C7EC]" />
                                                <Link href={`/companies/${driver.companyId}`} className="text-sm font-medium text-[#3E91DE] hover:underline">
                                                    {driver.company.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {driver.consentStatus === "VALID" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> On File
                                                </span>
                                            )}
                                            {driver.consentStatus === "EXPIRING_SOON" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 shadow-sm">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> Expiring in {driver.daysUntilExpired} Days
                                                </span>
                                            )}
                                            {driver.consentStatus === "EXPIRED" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200 shadow-sm">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Expired
                                                </span>
                                            )}
                                            {driver.consentStatus === "MISSING" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-300 shadow-sm">
                                                    Missing
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-[#143A82]">
                                            {driver.latestConsent?.validUntil ? format(new Date(driver.latestConsent.validUntil), 'MMM d, yyyy') : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/consents/new?driverId=${driver.id}`}
                                                    className="px-3 py-1.5 text-xs font-medium text-[#3E91DE] bg-[#3E91DE]/10 hover:bg-[#3E91DE] hover:text-white rounded transition-colors"
                                                >
                                                    {driver.latestConsent ? 'Update' : 'Log Consent'}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
