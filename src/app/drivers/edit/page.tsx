import { updateDriver } from "@/app/actions/drivers";
import { prisma } from "@/lib/prisma";
import { User, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteDriverButton } from "./DeleteDriverButton";
import TransferDriverButton from "./TransferDriverButton";

export const dynamic = 'force-dynamic';

export default async function EditDriverPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams;

    if (!id) {
        notFound();
    }

    const [driver, companies] = await Promise.all([
        prisma.driver.findUnique({
            where: { id },
            include: { company: true }
        }),
        prisma.company.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        })
    ]);

    if (!driver) {
        notFound();
    }

    const updateDriverWithId = updateDriver.bind(null, id);

    // Format DOB for the date input (YYYY-MM-DD)
    const formattedDob = driver.dob
        ? new Date(driver.dob).toISOString().split('T')[0]
        : "";

    return (
        <div className="p-8 sm:p-12 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href={`/drivers/${id}`} className="text-sm text-[#3E91DE] hover:text-[#143A82] font-medium flex items-center gap-1 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Driver Profile
                </Link>
            </div>

            <div className="bg-white border border-[#77C7EC]/20 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#77C7EC]/20 flex items-center gap-3 bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
                    <div className="p-2 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#143A82]">Edit Driver</h2>
                        <p className="text-sm text-[#3E91DE]">Update driver profile for {driver.company.name}.</p>
                    </div>
                </div>

                <form action={updateDriverWithId} className="p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    defaultValue={driver.firstName}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    defaultValue={driver.lastName}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="cdlNumber" className="text-sm font-medium text-slate-700">
                                    CDL Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="cdlNumber"
                                    name="cdlNumber"
                                    type="text"
                                    required
                                    defaultValue={driver.cdlNumber}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="D1234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="cdlState" className="text-sm font-medium text-slate-700">
                                    CDL State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="cdlState"
                                    name="cdlState"
                                    type="text"
                                    required
                                    defaultValue={driver.cdlState}
                                    className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                                    placeholder="TX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="dob" className="text-sm font-medium text-slate-700">
                                Date of Birth
                            </label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                defaultValue={formattedDob}
                                className="w-full px-4 py-2 border border-[#77C7EC]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent transition-shadow text-[#143A82]"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#77C7EC]/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <DeleteDriverButton driverId={driver.id} driverName={`${driver.firstName} ${driver.lastName}`} />
                            <TransferDriverButton
                                driverId={driver.id}
                                driverName={`${driver.firstName} ${driver.lastName}`}
                                currentCompanyId={driver.companyId}
                                companies={companies}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Link
                                href={`/drivers/${id}`}
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
