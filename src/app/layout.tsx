import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/inter";
import "./globals.css";
import { getSession } from "@/lib/auth";
import SidebarWrapper from "@/components/SidebarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClearinghouseGroup — TPA Management",
  description: "Internal TPA Clearinghouse Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <SidebarWrapper
          session={session ? { role: session.role, name: session.name } : null}
        >
          {children}
        </SidebarWrapper>
      </body>
    </html>
  );
}
