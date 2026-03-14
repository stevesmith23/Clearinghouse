"use server";

import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie, requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// --- Rate Limiting Config ---
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MIN = 15;

// --- Password Requirements ---
const MIN_PASSWORD_LENGTH = 8;

function validatePassword(password: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }
    return null;
}

async function getClientIp(): Promise<string> {
    try {
        const headersList = await headers();
        return (
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "unknown"
        );
    } catch {
        return "unknown";
    }
}

async function checkRateLimit(email: string): Promise<{ locked: boolean; minutesLeft?: number }> {
    try {
        const cutoff = new Date(Date.now() - LOCKOUT_DURATION_MIN * 60 * 1000);

        const recentAttempts = await prisma.loginAttempt.findMany({
            where: {
                email,
                success: false,
                createdAt: { gte: cutoff },
            },
            orderBy: { createdAt: "desc" },
        });

        if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
            const lastAttempt = recentAttempts[0];
            const unlockTime = new Date(lastAttempt.createdAt.getTime() + LOCKOUT_DURATION_MIN * 60 * 1000);
            const minutesLeft = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);

            if (minutesLeft > 0) {
                return { locked: true, minutesLeft };
            }
        }

        return { locked: false };
    } catch (e) {
        console.error("Rate limit check failed (table may not exist yet):", e);
        return { locked: false }; // Allow login if rate limiting fails
    }
}

async function recordLoginAttempt(email: string, success: boolean) {
    const ipAddress = await getClientIp();
    try {
        await prisma.loginAttempt.create({
            data: { email, success, ipAddress },
        });
    } catch (e) {
        console.error("Failed to record login attempt:", e);
    }
}

export async function login(_prevState: unknown, formData: FormData) {
    try {
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        const password = formData.get("password") as string;

        if (!email || !password) {
            return { error: "Email and password are required." };
        }

        // Check rate limit
        const rateLimit = await checkRateLimit(email);
        if (rateLimit.locked) {
            return {
                error: `Too many failed attempts. Account locked for ${rateLimit.minutesLeft} more minute(s). Try again later.`,
            };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            await recordLoginAttempt(email, false);
            return { error: "Invalid email or password." };
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            await recordLoginAttempt(email, false);

            // Check if this triggers lockout
            const newRateLimit = await checkRateLimit(email);
            if (newRateLimit.locked) {
                return {
                    error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MIN} minutes.`,
                };
            }

            return { error: "Invalid email or password." };
        }

        // Successful login — clear failed attempts and record success
        await recordLoginAttempt(email, true);

        await setSessionCookie({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        // Audit log
        await logAudit(user.id, user.name, "LOGIN", undefined, "Successful login");

        redirect("/");
    } catch (e: unknown) {
        // redirect() throws a special error in Next.js — rethrow it
        if (e && typeof e === "object" && "digest" in e) {
            throw e;
        }
        const message = e instanceof Error ? e.message : String(e);
        return { error: `Login failed: ${message}` };
    }
}

export async function logout() {
    await clearSessionCookie();
    redirect("/login");
}

export async function createUser(formData: FormData): Promise<void> {
    const session = await requireAuth("ADMIN");

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string) || "VIEWER";

    if (!email || !password || !name) {
        throw new Error("All fields are required.");
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
        throw new Error(passwordError);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("A user with that email already exists.");
    }

    const hashed = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

    await prisma.user.create({
        data: { email, password: hashed, name, role },
    });

    // Audit log
    await logAudit(session.id, session.name, "CREATE_USER", `user:${email}`, `Created ${role} user: ${name}`);

    revalidatePath("/settings/users");
}

export async function deleteUser(userId: string): Promise<void> {
    const session = await requireAuth("ADMIN");

    if (session.id === userId) {
        throw new Error("You cannot delete your own account.");
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.user.delete({ where: { id: userId } });

    // Audit log
    await logAudit(
        session.id,
        session.name,
        "DELETE_USER",
        `user:${targetUser?.email || userId}`,
        `Deleted user: ${targetUser?.name || "unknown"}`
    );

    revalidatePath("/settings/users");
}
