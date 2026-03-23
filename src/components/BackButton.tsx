"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:hover:text-white transition-colors mb-4 group"
        >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back
        </button>
    );
}
