"use client";

import { openAuthModal } from "@/lib/authModal";

export default function LoginButton({ children }: { children?: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="rounded-lg border px-5 py-3 text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60"
        >
            {children ?? "Log In"}
        </button>
    );
}
