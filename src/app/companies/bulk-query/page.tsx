import { logBulkCompanyQueries } from "@/app/actions/companies";
import { prisma } from "@/lib/prisma";
import { FileSearch, ArrowLeft, Save, Building2, AlertCircle, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BulkQueryPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
    const params = await searchParams;
    const companies = await prisma.company.findMany({
        include: {
            _count: {
                select: { drivers: true }
            }
        },
        orderBy: { name: "asc" }
    });

    const selectedCompanyId = params.companyId || "";
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="p-8 sm:p-12 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/companies" className="text-sm text-[#3E91DE] hover:text-[#143A82] font-medium flex items-center gap-1 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Company Compliance
                </Link>
            </div>

            <div className="bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#77C7EC]/20 flex items-center gap-3 bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
                    <div className="p-2 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                        <FileSearch className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#143A82]">Log Bulk Annual Query</h2>
                        <p className="text-sm text-[#3E91DE]">Record when you pulled the annual ClearinghouseGroup roster for a TPA client.</p>
                    </div>
                </div>

                <form action={logBulkCompanyQueries} className="p-6">
                    <div className="space-y-6">

                        <div className="space-y-2">
                            <label htmlFor="companyId" className="text-sm font-medium text-[#143A82] flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#3E91DE]" /> Select Company <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="companyId"
                                name="companyId"
                                required
                                defaultValue={selectedCompanyId}
                                className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82] bg-white"
                            >
                                <option value="" disabled>Search or select a company...</option>
                                {companies.map((company: any) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name} ({company._count.drivers} active drivers)
                                    </option>
                                ))}
                            </select>
                            {companies.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    You must add a <Link href="/companies/new" className="underline font-semibold">company</Link> first.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="queryDate" className="text-sm font-medium text-[#143A82]">
                                Date Bulk Roster Pulled <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="queryDate"
                                name="queryDate"
                                type="date"
                                required
                                defaultValue={today}
                                max={today}
                                className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                            />
                        </div>

                        <div className="bg-gradient-to-br from-[#77C7EC]/5 to-[#3E91DE]/5 p-5 rounded-lg border border-[#77C7EC]/20 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="updateDrivers"
                                        name="updateDrivers"
                                        defaultChecked
                                        className="w-4 h-4 text-[#3E91DE] border-[#77C7EC]/40 rounded focus:ring-[#3E91DE]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="updateDrivers" className="text-sm font-bold text-[#143A82] cursor-pointer">
                                        Cascade to Individual Drivers
                                    </label>
                                    <p className="text-xs text-[#3E91DE] mt-1">
                                        Automatically create &quot;Eligible&quot; Annual Query records for all active drivers in this company, resetting their individual 365-day timers to match the bulk date.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-[#77C7EC]/5 p-4 rounded-lg mt-6 border border-[#77C7EC]/20 text-sm text-[#143A82]">
                        <AlertCircle className="w-5 h-5 text-[#3E91DE] inline-block mr-2 -mt-0.5" />
                        Saving this record will update this company&apos;s next bulk deadline to exactly <strong>365 days</strong> from the Date Pulled.
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#77C7EC]/20 flex justify-end gap-3">
                        <Link
                            href="/companies"
                            className="px-5 py-2.5 bg-white border border-[#77C7EC]/30 text-[#143A82] rounded-lg font-medium hover:bg-[#77C7EC]/5 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={companies.length === 0}
                            className="px-5 py-2.5 bg-[#3E91DE] text-white rounded-lg font-medium hover:bg-[#143A82] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" /> Save Bulk Roster Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
