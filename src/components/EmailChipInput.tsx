"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface EmailChipInputProps {
    name: string;
    defaultValue: string;
    placeholder?: string;
}

export default function EmailChipInput({ name, defaultValue, placeholder }: EmailChipInputProps) {
    // Parse newline-separated emails into array
    const initialEmails = defaultValue
        ? defaultValue.split("\n").map(e => e.trim()).filter(e => e.length > 0)
        : [];

    const [emails, setEmails] = useState<string[]>(initialEmails);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function addEmail(email: string) {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;

        if (!isValidEmail(trimmed)) {
            setError("Please enter a valid email address");
            return;
        }

        if (emails.includes(trimmed)) {
            setError("This email is already added");
            return;
        }

        setEmails([...emails, trimmed]);
        setInputValue("");
        setError("");
    }

    function removeEmail(index: number) {
        setEmails(emails.filter((_, i) => i !== index));
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            addEmail(inputValue);
        }
        if (e.key === "Backspace" && !inputValue && emails.length > 0) {
            removeEmail(emails.length - 1);
        }
    }

    // Hidden input stores newline-separated value for form submission
    const hiddenValue = emails.join("\n");

    return (
        <div>
            <input type="hidden" name={name} value={hiddenValue} />

            {/* Email chips */}
            {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {emails.map((email, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3E91DE]/10 dark:bg-[#3E91DE]/20 text-[#143A82] dark:text-[#77C7EC] text-sm font-medium rounded-full border border-[#3E91DE]/20 dark:border-[#3E91DE]/30"
                        >
                            {email}
                            <button
                                type="button"
                                onClick={() => removeEmail(idx)}
                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div className="flex gap-2">
                <input
                    type="email"
                    value={inputValue}
                    onChange={e => { setInputValue(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Type an email and press Enter"}
                    className="flex-1 px-4 py-2 rounded-lg border border-[#77C7EC]/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#143A82] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all"
                />
                <button
                    type="button"
                    onClick={() => addEmail(inputValue)}
                    className="px-3 py-2 bg-[#3E91DE] hover:bg-[#143A82] text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Type an email address and press Enter or click Add. All system alerts will be sent to all listed addresses.</p>
        </div>
    );
}
