import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createUser } from "@/app/actions/auth";
import { DeleteUserButton } from "./DeleteUserButton";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    await requireAuth("ADMIN");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-8 pb-20 sm:p-12 bg-white min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <Link
                        href="/settings"
                        className="text-sm text-[#3E91DE] hover:text-[#143A82] font-medium flex items-center gap-1 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Settings
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">
                        User Management
                    </h1>
                    <p className="text-[#3E91DE] mt-1">Create and manage system users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#143A82]">
                            <UserPlus className="w-5 h-5 text-[#3E91DE]" />
                            Create User
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateUserForm />
                    </CardContent>
                </Card>

                {/* User List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#143A82]">
                            <Shield className="w-5 h-5 text-[#3E91DE]" />
                            Active Users ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="font-medium">No users found</p>
                                <p className="text-sm mt-1">Create the first user to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between py-4 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === "ADMIN"
                                                    ? "bg-gradient-to-br from-[#3E91DE] to-[#143A82]"
                                                    : "bg-gradient-to-br from-[#77C7EC] to-[#3E91DE]"
                                                    }`}
                                            >
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-[#143A82]">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-md font-semibold ${user.role === "ADMIN"
                                                    ? "bg-[#3E91DE]/10 text-[#143A82] border border-[#3E91DE]/20"
                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    }`}
                                            >
                                                {user.role === "ADMIN" ? (
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> Viewer
                                                    </span>
                                                )}
                                            </span>
                                            <DeleteUserButton userId={user.id} userName={user.name} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CreateUserForm() {
    return (
        <form action={createUser} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                </label>
                <input id="name" name="name" type="text" required placeholder="Jane Smith"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all" />
            </div>
            <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                </label>
                <input id="user-email" name="email" type="email" required placeholder="jane@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all" />
            </div>
            <div>
                <label htmlFor="user-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                </label>
                <input id="user-password" name="password" type="password" required placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all" />
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                </label>
                <select id="role" name="role"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all">
                    <option value="VIEWER">Viewer (Read-Only)</option>
                    <option value="ADMIN">Admin (Full Access)</option>
                </select>
            </div>
            <button type="submit"
                className="w-full py-2.5 bg-[#3E91DE] hover:bg-[#143A82] text-white font-semibold rounded-lg shadow-sm transition-colors text-sm">
                Create User
            </button>
        </form>
    );
}
