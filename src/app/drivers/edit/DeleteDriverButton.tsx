"use client";

import { useState } from "react";
import { deleteDriver } from "@/app/actions/drivers";
import { Trash2 } from "lucide-react";

export function DeleteDriverButton({ driverId, driverName }: { driverId: string, driverName: string }) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteDriver(driverId);
        } catch (error) {
            console.error("Failed to delete driver:", error);
            setIsDeleting(false);
            setIsConfirming(false);
        }
    }

    if (isConfirming) {
        return (
            <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
                <span className="text-sm text-red-800 font-medium">Delete {driverName}?</span>
                <button
                    onClick={() => setIsConfirming(false)}
                    className="px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setIsConfirming(true)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2 text-sm font-medium"
        >
            <Trash2 className="w-4 h-4" /> Delete Driver
        </button>
    );
}
