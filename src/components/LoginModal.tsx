"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";


export default function LoginModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const search = useSearchParams();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    function getReturnUrl() {
        const cb = search.get("callbackUrl");
        if (cb) return cb;
        return typeof window !== "undefined" ? window.location.href : "/";
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: getReturnUrl(),
        });

        if (res?.url) {
            router.replace(res.url);
        } else {
            router.refresh();
        }
        onClose();
    }

    const handleOAuth = (provider: "google" | "azure-ad") => {
        signIn(provider, { callbackUrl: getReturnUrl() });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose} // 👈 clicking the backdrop closes
            aria-modal="true"
            role="dialog"
            aria-labelledby="login-title"
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()} // 👈 prevent backdrop close when clicking inside
            >
                <h2
                    id="login-title"
                    className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white"
                >
                    Log in to your account
                </h2>

                {/* Credentials form */}
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        ref={emailRef}
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition hover:bg-black disabled:opacity-60"
                    >
                        {loading ? "Signing in…" : "Log in with email"}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    <span className="px-3 text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Social logins (neutral, with inline logos) */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleOAuth("google")}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        {/* Google "G" */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.22 3.6l6.85-6.85C35.9 2.7 30.47 0 24 0 14.62 0 6.47 5.38 2.55 13.22l7.98 6.19C12.1 13.02 17.62 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.1 24.5c0-1.59-.14-3.12-.41-4.59H24v9.18h12.5c-.54 2.89-2.19 5.34-4.66 6.98l7.18 5.57C43.73 37.33 46.1 31.36 46.1 24.5z" />
                            <path fill="#FBBC05" d="M10.53 28.41c-1.1-3.29-1.1-6.82 0-10.11l-7.98-6.19c-3.36 6.73-3.36 14.78 0 21.51l7.98-6.21z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.91-2.14 15.88-5.81l-7.18-5.57c-2.02 1.36-4.62 2.16-8.7 2.16-6.38 0-11.9-3.52-14.47-8.69l-7.98 6.21C6.47 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleOAuth("azure-ad")}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        {/* Outlook / Microsoft 365 */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                            <path fill="#0078D4" d="M4 12c0-2.21 1.79-4 4-4h24v32H8c-2.21 0-4-1.79-4-4V12z" />
                            <path fill="#0364B8" d="M32 8h8c2.21 0 4 1.79 4 4v24c0 2.21-1.79 4-4 4h-8V8z" />
                            <path fill="#28A8EA" d="M12 19c0-1.66 1.34-3 3-3h11v16H15c-1.66 0-3-1.34-3-3V19z" />
                            <path fill="#fff" d="M19.5 30c-3.04 0-5.5-2.46-5.5-5.5s2.46-5.5 5.5-5.5S25 21.46 25 24.5 22.54 30 19.5 30zm0-2c1.93 0 3.5-1.57 3.5-3.5S21.43 21 19.5 21 16 22.57 16 24.5 17.57 28 19.5 28z" />
                        </svg>
                        Continue with Outlook
                    </button>
                </div>


                {/* Cancel */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
