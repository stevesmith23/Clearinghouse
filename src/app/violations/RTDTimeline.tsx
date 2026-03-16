"use client";

import { useState } from "react";
import { updateViolationRTD } from "@/app/actions/violations";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, Save, User, Phone, Mail } from "lucide-react";

interface Violation {
    id: string;
    driverId: string;
    driver: { firstName: string; lastName: string; id: string; cdlNumber: string };
    violationDate: string;
    violationType: string;
    reportedBy: string;
    status: string;
    notes: string | null;
    sapName: string | null;
    sapPhone: string | null;
    sapEmail: string | null;
    removedFromDutyDate: string | null;
    sapInitialEvalDate: string | null;
    treatmentCompletedDate: string | null;
    sapFollowUpEvalDate: string | null;
    rtdTestDate: string | null;
    rtdTestResult: string | null;
    clearedDate: string | null;
}

function formatDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RTDTimeline({ violation }: { violation: Violation }) {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [sapName, setSapName] = useState(violation.sapName || "");
    const [sapPhone, setSapPhone] = useState(violation.sapPhone || "");
    const [sapEmail, setSapEmail] = useState(violation.sapEmail || "");
    const [removedDate, setRemovedDate] = useState(violation.removedFromDutyDate?.split("T")[0] || "");
    const [sapInitial, setSapInitial] = useState(violation.sapInitialEvalDate?.split("T")[0] || "");
    const [treatmentDone, setTreatmentDone] = useState(violation.treatmentCompletedDate?.split("T")[0] || "");
    const [sapFollowUp, setSapFollowUp] = useState(violation.sapFollowUpEvalDate?.split("T")[0] || "");
    const [rtdTest, setRtdTest] = useState(violation.rtdTestDate?.split("T")[0] || "");
    const [rtdResult, setRtdResult] = useState(violation.rtdTestResult || "");
    const [clearedDate, setClearedDate] = useState(violation.clearedDate?.split("T")[0] || "");
    const [notes, setNotes] = useState(violation.notes || "");

    const steps = [
        { label: "Removed from Duty", date: removedDate, key: "removedFromDutyDate" },
        { label: "SAP Initial Evaluation", date: sapInitial, key: "sapInitialEvalDate" },
        { label: "Treatment/Education Completed", date: treatmentDone, key: "treatmentCompletedDate" },
        { label: "SAP Follow-Up Evaluation", date: sapFollowUp, key: "sapFollowUpEvalDate" },
        { label: "Return-to-Duty Test", date: rtdTest, key: "rtdTestDate", extra: rtdResult },
        { label: "Cleared to Return", date: clearedDate, key: "clearedDate" },
    ];

    const completedSteps = steps.filter(s => s.date).length;
    const progressPercent = Math.round((completedSteps / steps.length) * 100);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        await updateViolationRTD(violation.id, {
            sapName, sapPhone, sapEmail,
            removedFromDutyDate: removedDate || undefined,
            sapInitialEvalDate: sapInitial || undefined,
            treatmentCompletedDate: treatmentDone || undefined,
            sapFollowUpEvalDate: sapFollowUp || undefined,
            rtdTestDate: rtdTest || undefined,
            rtdTestResult: rtdResult || undefined,
            clearedDate: clearedDate || undefined,
            notes: notes || undefined,
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
            {/* Header row */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${violation.status === "CLEARED" ? "bg-emerald-500" : violation.status === "RTD_ELIGIBLE" ? "bg-indigo-500" : "bg-red-500"}`} />
                    <div className="min-w-0">
                        <p className="font-semibold text-[#143A82] truncate">{violation.driver.firstName} {violation.driver.lastName}</p>
                        <p className="text-xs text-slate-500">
                            {violation.violationType.replace(/_/g, " ")} · {new Date(violation.violationDate).toLocaleDateString()} · CDL: {violation.driver.cdlNumber}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {/* Progress bar */}
                    <div className="hidden sm:flex items-center gap-2 w-40">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${violation.status === "CLEARED" ? "bg-emerald-500" : "bg-[#3E91DE]"}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{completedSteps}/{steps.length}</span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        violation.status === "CLEARED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        violation.status === "RTD_ELIGIBLE" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                        "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                        {violation.status.replace(/_/g, " ")}
                    </span>

                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                        {/* Timeline */}
                        <div className="lg:col-span-2">
                            <h4 className="text-sm font-bold text-[#143A82] mb-4">RTD Progress Timeline</h4>
                            <div className="space-y-0">
                                {steps.map((step, idx) => (
                                    <div key={step.key} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            {step.date ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                                            )}
                                            {idx < steps.length - 1 && (
                                                <div className={`w-0.5 h-8 ${step.date ? "bg-emerald-300" : "bg-slate-200"}`} />
                                            )}
                                        </div>
                                        <div className="pb-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${step.date ? "text-[#143A82]" : "text-slate-400"}`}>
                                                    {step.label}
                                                </span>
                                                {step.extra && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                                                        step.extra === "NEGATIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    }`}>{step.extra}</span>
                                                )}
                                            </div>
                                            {step.date ? (
                                                <p className="text-xs text-emerald-600 mt-0.5">{formatDate(step.date)}</p>
                                            ) : (
                                                <p className="text-xs text-slate-400 mt-0.5">Pending</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SAP Info */}
                        <div>
                            <h4 className="text-sm font-bold text-[#143A82] mb-4">SAP Information</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1"><User className="w-3 h-3" /> SAP Name</label>
                                    <input type="text" value={sapName} onChange={e => setSapName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent" placeholder="Dr. Jane Smith" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> Phone</label>
                                    <input type="text" value={sapPhone} onChange={e => setSapPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent" placeholder="(555) 123-4567" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1"><Mail className="w-3 h-3" /> Email</label>
                                    <input type="text" value={sapEmail} onChange={e => setSapEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE] focus:border-transparent" placeholder="sap@example.com" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Date Inputs */}
                    <div className="px-6 pb-4">
                        <h4 className="text-sm font-bold text-[#143A82] mb-3">Update Milestones</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Removed from Duty</label>
                                <input type="date" value={removedDate} onChange={e => setRemovedDate(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">SAP Initial Eval</label>
                                <input type="date" value={sapInitial} onChange={e => setSapInitial(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Treatment Done</label>
                                <input type="date" value={treatmentDone} onChange={e => setTreatmentDone(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">SAP Follow-Up Eval</label>
                                <input type="date" value={sapFollowUp} onChange={e => setSapFollowUp(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">RTD Test Date</label>
                                <input type="date" value={rtdTest} onChange={e => setRtdTest(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">RTD Test Result</label>
                                <select value={rtdResult} onChange={e => setRtdResult(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]">
                                    <option value="">Select...</option>
                                    <option value="NEGATIVE">Negative</option>
                                    <option value="POSITIVE">Positive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Cleared Date</label>
                                <input type="date" value={clearedDate} onChange={e => setClearedDate(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE]" />
                            </div>
                        </div>
                    </div>

                    {/* Notes + Save */}
                    <div className="px-6 pb-6">
                        <div className="mb-4">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3E91DE] resize-none"
                                placeholder="Additional notes about this violation or RTD progress..." />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-[#3E91DE] hover:bg-[#143A82] text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            {saved && (
                                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Saved successfully
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
