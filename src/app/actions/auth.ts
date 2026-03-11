"use server";

import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie, requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function login(_prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return { error: "Invalid email or password." };
    }

    await setSessionCookie({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });

    redirect("/");
}

export async function logout() {
    await clearSessionCookie();
    redirect("/login");
}

export async function createUser(formData: FormData): Promise<void> {
    await requireAuth("ADMIN");

    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string) || "VIEWER";

    if (!email || !password || !name) {
        throw new Error("All fields are required.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("A user with that email already exists.");
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: { email, password: hashed, name, role },
    });

    revalidatePath("/settings/users");
}

export async function deleteUser(userId: string): Promise<void> {
    const session = await requireAuth("ADMIN");

    if (session.id === userId) {
        throw new Error("You cannot delete your own account.");
    }

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/settings/users");
}
