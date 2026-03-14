import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "clearinghouse-dev-secret-key-change-in-prod";
const COOKIE_NAME = "session";

export interface SessionPayload {
    id: string;
    email: string;
    name: string;
    role: string;
}

export function encrypt(payload: SessionPayload): string {
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
        .createHmac("sha256", SECRET)
        .update(data)
        .digest("base64url");
    return `${data}.${signature}`;
}

export function decrypt(token: string): SessionPayload | null {
    try {
        const [data, signature] = token.split(".");
        if (!data || !signature) return null;

        const expectedSig = crypto
            .createHmac("sha256", SECRET)
            .update(data)
            .digest("base64url");

        if (signature !== expectedSig) return null;

        return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return decrypt(token);
}

export async function requireAuth(requiredRole?: string): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    if (requiredRole && session.role !== requiredRole) {
        redirect("/");
    }
    return session;
}

export async function setSessionCookie(payload: SessionPayload) {
    const token = encrypt(payload);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours (workday session)
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
