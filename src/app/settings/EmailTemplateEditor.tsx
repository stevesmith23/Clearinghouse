"use client";

import { useState } from "react";
import { updateEmailTemplate, resetEmailTemplate } from "@/app/actions/email-templates";
import { ChevronDown, ChevronUp, Save, RotateCcw, Eye, Code, Mail } from "lucide-react";

interface Template {
    id: string;
    slug: string;
    name: string;
    subject: string;
    body: string;
    description: string | null;
}

export default function EmailTemplateEditor({ templates }: { templates: Template[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);

    const toggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        setPreviewId(null);
    };

    const handleSave = async (formData: FormData) => {
        const id = formData.get("id") as string;
        setSaving(id);
        await updateEmailTemplate(formData);
        setSaving(null);
    };

    const handleReset = async (formData: FormData) => {
        if (!confirm("Reset this template to the default? Your customizations will be lost.")) return;
        const slug = formData.get("slug") as string;
        const template = templates.find(t => t.slug === slug);
        setSaving(template?.id || null);
        await resetEmailTemplate(formData);
        setSaving(null);
        // Force page refresh to show updated content
        window.location.reload();
    };

    return (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {templates.map((t) => {
                const isExpanded = expandedId === t.id;
                const isPreview = previewId === t.id;
                const isSaving = saving === t.id;

                return (
                    <div key={t.id}>
                        {/* Header row */}
                        <button
                            onClick={() => toggle(t.id)}
                            className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded"
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#3E91DE] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#143A82] dark:text-white">{t.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                                </div>
                            </div>
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                        </button>

                        {/* Expanded editor */}
                        {isExpanded && (
                            <form action={handleSave} className="pb-4 pl-8 pr-1 space-y-4">
                                <input type="hidden" name="id" value={t.id} />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject Line</label>
                                    <input
                                        name="subject"
                                        defaultValue={t.subject}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#143A82] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            {isPreview ? "Preview" : "HTML Body"}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewId(isPreview ? null : t.id)}
                                            className="flex items-center gap-1 text-xs text-[#3E91DE] hover:text-[#143A82] transition-colors"
                                        >
                                            {isPreview ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            {isPreview ? "Edit HTML" : "Preview"}
                                        </button>
                                    </div>

                                    {isPreview ? (
                                        <div
                                            className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-800 text-sm min-h-[200px]"
                                            dangerouslySetInnerHTML={{ __html: t.body }}
                                        />
                                    ) : (
                                        <textarea
                                            name="body"
                                            defaultValue={t.body}
                                            rows={12}
                                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#143A82] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 resize-y"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400">
                                        Variables: {"{{driverName}}"} {"{{companyName}}"} {"{{queryBalance}}"} {"{{driverCount}}"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <form action={handleReset}>
                                            <input type="hidden" name="slug" value={t.slug} />
                                            <button
                                                type="submit"
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
                                            >
                                                <RotateCcw className="w-3 h-3" /> Reset to Default
                                            </button>
                                        </form>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#3E91DE] hover:bg-[#143A82] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-3 h-3" /> {isSaving ? "Saving..." : "Save Template"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
