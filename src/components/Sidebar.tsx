"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    FileSearch,
    ClipboardCheck,
    UserCheck,
    Settings,
    FileSpreadsheet,
    BarChart3,
    LogOut,
    Shield,
    Eye,
    AlertCircle,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
    userRole: string;
    userName: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, adminOnly: false },
        { name: "Alerts", href: "/alerts", icon: AlertCircle, adminOnly: false },
        { name: "Companies", href: "/companies", icon: Building2, adminOnly: false },
        { name: "Drivers", href: "/drivers", icon: Users, adminOnly: false },
        { name: "Pre-Employment", href: "/pre-employment", icon: UserCheck, adminOnly: false },
        { name: "Consents", href: "/consents", icon: ClipboardCheck, adminOnly: false },
        { name: "Queries", href: "/queries", icon: FileSearch, adminOnly: false },
        { name: "Billing", href: "/billing", icon: FileSpreadsheet, adminOnly: true },
        { name: "Reports", href: "/reports", icon: BarChart3, adminOnly: true },
        { name: "Settings", href: "/settings", icon: Settings, adminOnly: true },
    ];

    const visibleItems = navItems.filter(
        (item) => !item.adminOnly || userRole === "ADMIN"
    );

    return (
        <div className="flex h-screen w-64 flex-col bg-white border-r border-[#77C7EC]/20 text-slate-700 font-sans transition-all duration-300 shadow-sm">
            <div className="flex h-16 items-center px-6 border-b border-[#77C7EC]/20">
                <div className="flex items-center gap-2 text-xl font-bold text-slate-800 tracking-tight">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mt-0.5 shrink-0"
                    >
                        <polygon points="6,65 6,15 41,0 41,50" fill="#77C7EC" />
                        <polygon points="31,80 31,30 66,15 66,65" fill="#3E91DE" />
                        <polygon points="56,95 56,45 91,30 91,80" fill="#143A82" />
                    </svg>
                    <span className="-ml-1 text-[#143A82]">
                        Clearinghouse
                        <span className="font-semibold text-[#3E91DE]">Group</span>
                    </span>
                </div>
            </div>
            <nav className="flex-1 space-y-2 px-4 py-8">
                {visibleItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-[#77C7EC]/10 text-[#143A82] shadow-sm border border-[#77C7EC]/30"
                                    : "text-slate-600 hover:bg-[#77C7EC]/5 hover:text-[#3E91DE]"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-[#77C7EC]/20 space-y-3">
                <div className="bg-gradient-to-br from-[#77C7EC]/5 to-[#3E91DE]/5 border border-[#77C7EC]/20 rounded-lg p-4 text-xs">
                    <p className="text-[#3E91DE] mb-1 font-medium">ClearinghouseGroup</p>
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#143A82]">{userName}</p>
                        <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${userRole === "ADMIN"
                                    ? "bg-[#3E91DE]/15 text-[#143A82]"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                        >
                            {userRole === "ADMIN" ? (
                                <span className="flex items-center gap-0.5">
                                    <Shield className="w-2.5 h-2.5" /> ADMIN
                                </span>
                            ) : (
                                <span className="flex items-center gap-0.5">
                                    <Eye className="w-2.5 h-2.5" /> VIEWER
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
