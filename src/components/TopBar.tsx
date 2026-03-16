"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Moon, Sun, Bell, X, Building2, Users, FileSearch, ExternalLink, Menu } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
    type: "company" | "driver" | "query";
    id: string;
    title: string;
    subtitle: string;
    href: string;
}

interface Notification {
    id: string;
    type: "warning" | "danger" | "info";
    title: string;
    message: string;
    href: string;
    time: string;
}

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifLoaded, setNotifLoaded] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
                setNotifOpen(false);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data.results || []);
            } catch {
                setSearchResults([]);
            }
            setSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        if (notifLoaded) return;
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setNotifications(data.notifications || []);
            setNotifLoaded(true);
        } catch {
            setNotifications([]);
        }
    }, [notifLoaded]);

    const handleNotifClick = () => {
        setNotifOpen(!notifOpen);
        if (!notifOpen) loadNotifications();
    };

    const iconForType = (type: string) => {
        switch (type) {
            case "company": return <Building2 className="w-4 h-4 text-[#3E91DE] shrink-0" />;
            case "driver": return <Users className="w-4 h-4 text-emerald-500 shrink-0" />;
            case "query": return <FileSearch className="w-4 h-4 text-indigo-500 shrink-0" />;
            default: return null;
        }
    };

    const unreadCount = notifications.length;

    return (
        <>
            <div className="h-14 border-b border-[#77C7EC]/20 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors gap-2">
                {/* Left side: hamburger + search */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Hamburger menu — mobile only */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors lg:hidden shrink-0"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search trigger */}
                    <button
                        onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#3E91DE] text-slate-400 dark:text-slate-500 text-sm transition-colors bg-slate-50 dark:bg-slate-800 w-full sm:w-64 sm:max-w-xs"
                    >
                        <Search className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Search everything...</span>
                        <span className="sm:hidden">Search...</span>
                        <kbd className="ml-auto text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono hidden sm:inline">Ctrl+K</kbd>
                    </button>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notification bell */}
                    <div ref={notifRef} className="relative">
                        <button
                            onClick={handleNotifClick}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>

                        {/* Notification dropdown */}
                        {notifOpen && (
                            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-[#143A82] dark:text-white">Notifications</h3>
                                    <span className="text-xs text-slate-400">{unreadCount} items</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-slate-400">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            All clear! No notifications.
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <Link
                                                key={n.id}
                                                href={n.href}
                                                onClick={() => setNotifOpen(false)}
                                                className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "danger" ? "bg-red-500" : n.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[#143A82] dark:text-white truncate">{n.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                                <Link
                                    href="/alerts"
                                    onClick={() => setNotifOpen(false)}
                                    className="block text-center text-xs font-medium text-[#3E91DE] py-2.5 border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    View All Alerts →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Modal Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
                    <div
                        ref={searchRef}
                        className="w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <Search className="w-5 h-5 text-[#3E91DE] shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search companies, drivers, queries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-[#143A82] dark:text-white placeholder:text-slate-400 outline-none"
                                autoFocus
                            />
                            <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {searching && (
                                <div className="p-6 text-center text-sm text-slate-400">Searching...</div>
                            )}
                            {!searching && searchQuery && searchResults.length === 0 && (
                                <div className="p-6 text-center text-sm text-slate-400">
                                    No results found for &quot;{searchQuery}&quot;
                                </div>
                            )}
                            {!searching && searchResults.map((r) => (
                                <Link
                                    key={`${r.type}-${r.id}`}
                                    href={r.href}
                                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                >
                                    {iconForType(r.type)}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-[#143A82] dark:text-white truncate">{r.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{r.subtitle}</p>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                </Link>
                            ))}
                            {!searching && !searchQuery && (
                                <div className="p-6 text-center text-sm text-slate-400">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    Type to search across companies, drivers, and queries
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
