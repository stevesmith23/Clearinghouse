"use client";

import { useState, useTransition } from "react";
import { addDriverNote } from "@/app/actions/drivers";
import { StickyNote, Send } from "lucide-react";

type Note = {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
};

export default function DriverNotes({ driverId, notes }: { driverId: string; notes: Note[] }) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        startTransition(async () => {
            await addDriverNote(driverId, content);
            setContent("");
        });
    }

    return (
        <div className="bg-white dark:bg-slate-800 border border-[#77C7EC]/20 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#77C7EC]/20 dark:border-slate-700 bg-gradient-to-r from-[#77C7EC]/5 to-transparent">
                <h3 className="font-semibold text-[#143A82] dark:text-white flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-[#3E91DE]" />
                    Internal Notes
                </h3>
            </div>

            <div className="p-4">
                {/* Add Note Form */}
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#3E91DE] focus:outline-none dark:bg-slate-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !content.trim()}
                        className="px-3 py-2 bg-[#3E91DE] hover:bg-[#143A82] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
                    >
                        <Send className="w-3.5 h-3.5" />
                        {isPending ? "..." : "Add"}
                    </button>
                </form>

                {/* Notes List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notes.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">No notes yet. Add one above.</p>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                <p className="text-sm text-slate-700 dark:text-slate-200">{note.content}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs font-medium text-[#3E91DE]">{note.createdBy}</span>
                                    <span className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
