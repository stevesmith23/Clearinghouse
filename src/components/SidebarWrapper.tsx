"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ThemeProvider } from "./ThemeProvider";
import { IdleLogout } from "./IdleLogout";

interface SidebarWrapperProps {
    session: { role: string; name: string } | null;
    children: React.ReactNode;
}

export default function SidebarWrapper({ session, children }: SidebarWrapperProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login" || pathname.startsWith("/login");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!session || isLoginPage) {
        return <>{children}</>;
    }

    return (
        <ThemeProvider>
            <div className="flex min-h-screen">
                {/* Mobile overlay backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar — hidden on mobile, slides in when open */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <Sidebar
                        userRole={session.role}
                        userName={session.name}
                        onNavigate={() => setSidebarOpen(false)}
                    />
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth w-full">
                    <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
                <IdleLogout />
            </div>
        </ThemeProvider>
    );
}
