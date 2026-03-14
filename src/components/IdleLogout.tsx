"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms
const WARNING_BEFORE = 2 * 60 * 1000; // Show warning 2 minutes before logout

export function IdleLogout() {
    const router = useRouter();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningBannerRef = useRef<HTMLDivElement | null>(null);

    const showWarning = useCallback(() => {
        // Create a warning banner at the top of the page
        if (!warningBannerRef.current) {
            const banner = document.createElement("div");
            banner.id = "idle-warning-banner";
            banner.style.cssText =
                "position:fixed;top:0;left:0;right:0;z-index:9999;background:#dc2626;color:white;text-align:center;padding:12px;font-size:14px;font-weight:600;";
            banner.textContent =
                "⚠️ You will be signed out in 2 minutes due to inactivity. Move your mouse or press a key to stay signed in.";
            document.body.prepend(banner);
            warningBannerRef.current = banner;
        }
    }, []);

    const hideWarning = useCallback(() => {
        if (warningBannerRef.current) {
            warningBannerRef.current.remove();
            warningBannerRef.current = null;
        }
    }, []);

    const handleLogout = useCallback(async () => {
        hideWarning();
        // Call the logout action via form submission
        try {
            const res = await fetch("/login", { method: "GET" });
            if (res.ok) {
                router.push("/login?reason=idle");
            }
        } catch {
            router.push("/login?reason=idle");
        }
    }, [router, hideWarning]);

    const resetTimer = useCallback(() => {
        hideWarning();

        if (warningRef.current) clearTimeout(warningRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);

        // Show warning 2 minutes before logout
        warningRef.current = setTimeout(showWarning, IDLE_TIMEOUT - WARNING_BEFORE);

        // Actual logout
        timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT);
    }, [handleLogout, showWarning, hideWarning]);

    useEffect(() => {
        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

        // Throttle to avoid excessive resets
        let lastReset = Date.now();
        const throttledReset = () => {
            const now = Date.now();
            if (now - lastReset > 10000) {
                // Only reset every 10 seconds
                lastReset = now;
                resetTimer();
            }
        };

        events.forEach((event) => window.addEventListener(event, throttledReset, { passive: true }));
        resetTimer();

        return () => {
            events.forEach((event) => window.removeEventListener(event, throttledReset));
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
            hideWarning();
        };
    }, [resetTimer, hideWarning]);

    return null; // This component renders nothing — it's purely functional
}
