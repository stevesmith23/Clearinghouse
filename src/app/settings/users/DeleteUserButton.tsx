"use client";

import { deleteUser } from "@/app/actions/auth";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({
    userId,
    userName,
}: {
    userId: string;
    userName: string;
}) {
    const deleteAction = deleteUser.bind(null, userId);

    return (
        <form action={deleteAction}>
            <button
                type="submit"
                title={`Delete ${userName}`}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                    if (
                        !confirm(
                            `Are you sure you want to delete user "${userName}"? This cannot be undone.`
                        )
                    ) {
                        e.preventDefault();
                    }
                }}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </form>
    );
}
