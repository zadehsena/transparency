"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Close on Escape
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        // Autofocus first field
        emailRef.current?.focus();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
            return;
        }

        // credentials login succeeded -> reload page
        window.location.href = "/";
    }

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

                {/* Social logins */}
                <div className="space-y-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-white transition hover:bg-red-600"
                    >
                        Continue with Google
                    </button>

                    <button
                        onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700"
                    >
                        Continue with Outlook
                    </button>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    <span className="px-3 text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>

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
