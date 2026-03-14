import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.SESSION_SECRET || "clearinghouse-dev-secret-key-change-in-prod";

// Web Crypto API compatible HMAC verification for Edge Runtime
async function decryptEdge(token: string): Promise<{ role?: string } | null> {
    try {
        const [data, signature] = token.split(".");
        if (!data || !signature) return null;

        // Import the secret key for HMAC-SHA256
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        // Compute expected signature
        const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

        // Convert ArrayBuffer to base64url
        const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sig)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        if (signature !== expectedSig) return null;

        // Decode the base64url data
        const decoded = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login"];
// Routes that require ADMIN role
const ADMIN_ONLY_PATHS = [
    "/settings",
    "/billing",
    "/reports",
    "/companies/new",
    "/companies/edit",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API cron routes (they use CRON_SECRET), static files, and Next.js internals
    if (
        pathname.startsWith("/api/cron") ||
        pathname.startsWith("/api/migrate") ||
        pathname.startsWith("/api/export") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".png")
    ) {
        return NextResponse.next();
    }

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.next();
    }

    // Check for session cookie
    const token = request.cookies.get("session")?.value;
    if (!token) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    const session = await decryptEdge(token);
    if (!session) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Check ADMIN-only routes for VIEWER users
    if (session.role === "VIEWER") {
        const isAdminRoute = ADMIN_ONLY_PATHS.some(
            (p) => pathname === p || pathname.startsWith(p + "/")
        );
        if (isAdminRoute) {
            const homeUrl = new URL("/", request.url);
            return NextResponse.redirect(homeUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
