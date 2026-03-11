"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

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
        <div className="flex min-h-screen">
            <Sidebar userRole={session.role} userName={session.name} />
            <main className="flex-1 overflow-y-auto scroll-smooth">
                {children}
            </main>
        </div>
    );
}
