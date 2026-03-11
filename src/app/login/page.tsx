"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="w-full max-w-md mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="6,65 6,15 41,0 41,50" fill="#77C7EC" />
                            <polygon points="31,80 31,30 66,15 66,65" fill="#3E91DE" />
                            <polygon points="56,95 56,45 91,30 91,80" fill="#143A82" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[#143A82] tracking-tight">
                        Clearinghouse<span className="text-[#3E91DE]">Group</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
                </div>

                {/* Error */}
                {state?.error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium text-center">
                        {state.error}
                    </div>
                )}

                {/* Form */}
                <form action={formAction} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="you@company.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-2.5 bg-gradient-to-r from-[#3E91DE] to-[#143A82] hover:from-[#143A82] hover:to-[#3E91DE] text-white font-semibold rounded-lg shadow-lg shadow-[#3E91DE]/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                        {isPending ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-xs text-center text-slate-400 mt-6">
                    Internal TPA Management System
                </p>
            </div>
        </div>
    );
}
