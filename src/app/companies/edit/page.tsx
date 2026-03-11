import { updateCompany } from "@/app/actions/companies";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteCompanyButton } from "./DeleteCompanyButton";

export const dynamic = 'force-dynamic';

export default async function EditCompanyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams;

    if (!id) {
        notFound();
    }

    const company = await prisma.company.findUnique({
        where: { id }
    });

    if (!company) {
        notFound();
    }

    // Creating a bound action that passes the ID to the server action
    const updateCompanyWithId = updateCompany.bind(null, id);

    return (
        <div className="p-8 sm:p-12 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/companies" className="text-sm text-[#3E91DE] hover:text-[#143A82] font-medium flex items-center gap-1 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Companies
                </Link>
            </div>

            <div className="bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#77C7EC]/20 flex items-center gap-3 bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
                    <div className="p-2 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#143A82]">Edit Company</h2>
                        <p className="text-sm text-[#3E91DE]">Update the employer profile details.</p>
                    </div>
                </div>

                <form action={updateCompanyWithId} className="p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                defaultValue={company.name}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900"
                                placeholder="e.g. Acme Transport LLC"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="dotNumber" className="text-sm font-medium text-slate-700">
                                    DOT Number
                                </label>
                                <input
                                    id="dotNumber"
                                    name="dotNumber"
                                    type="text"
                                    defaultValue={company.dotNumber || ""}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="e.g. 1234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    defaultValue={company.phone || ""}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={company.email || ""}
                                className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                placeholder="contact@acmetransport.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="queryBalance" className="text-sm font-medium text-slate-700">
                                Available Query Balance
                            </label>
                            <input
                                id="queryBalance"
                                name="queryBalance"
                                type="number"
                                min="0"
                                defaultValue={company.queryBalance}
                                className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                placeholder="e.g. 50"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#77C7EC]/20 flex justify-between items-center">
                        <DeleteCompanyButton companyId={company.id} companyName={company.name} />
                        <div className="flex justify-end gap-3">
                            <Link
                                href={`/companies/${id}`}
                                className="px-5 py-2.5 bg-white border border-[#77C7EC]/30 text-[#143A82] rounded-lg font-medium hover:bg-[#77C7EC]/5 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-[#3E91DE] text-white rounded-lg font-medium hover:bg-[#143A82] transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
