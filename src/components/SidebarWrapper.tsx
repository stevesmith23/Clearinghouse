"use client";

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

    if (!session || isLoginPage) {
        return <>{children}</>;
    }

    return (
        <ThemeProvider>
            <div className="flex min-h-screen">
                <Sidebar userRole={session.role} userName={session.name} />
                <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth">
                    <TopBar />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
                <IdleLogout />
            </div>
        </ThemeProvider>
    );
}
