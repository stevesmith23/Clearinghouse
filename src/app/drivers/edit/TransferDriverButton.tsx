"use client";

import { useState } from "react";
import { transferDriver } from "@/app/actions/drivers";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Company {
    id: string;
    name: string;
}

export default function TransferDriverButton({ driverId, driverName, currentCompanyId, companies }: {
    driverId: string;
    driverName: string;
    currentCompanyId: string;
    companies: Company[];
}) {
    const [showModal, setShowModal] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [transferring, setTransferring] = useState(false);
    const [transferred, setTransferred] = useState(false);
    const router = useRouter();

    const availableCompanies = companies.filter(c => c.id !== currentCompanyId);

    async function handleTransfer() {
        if (!selectedCompanyId) return;
        setTransferring(true);
        const result = await transferDriver(driverId, selectedCompanyId);
        setTransferring(false);

        if (result.success) {
            setTransferred(true);
            setTimeout(() => {
                setShowModal(false);
                setTransferred(false);
                router.refresh();
            }, 1500);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-2 transition-colors"
            >
                <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
                        {transferred ? (
                            <div className="text-center py-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-[#143A82] dark:text-white">Transfer Complete</h3>
                                <p className="text-sm text-slate-500 mt-1">{driverName} has been moved successfully.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-[#143A82] dark:text-white flex items-center gap-2 mb-1">
                                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                                    Transfer Driver
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Move <span className="font-semibold text-[#143A82] dark:text-white">{driverName}</span> to a different company.
                                </p>

                                <div className="mb-6">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Select New Company</label>
                                    <select
                                        value={selectedCompanyId}
                                        onChange={e => setSelectedCompanyId(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE] dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="">Choose a company...</option>
                                        {availableCompanies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setSelectedCompanyId(""); }}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTransfer}
                                        disabled={!selectedCompanyId || transferring}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                        {transferring ? "Transferring..." : "Transfer Driver"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
