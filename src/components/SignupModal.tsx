"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type SignupForm = {
    name: string;
    email: string;
    password: string;
};

export default function SignupModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState<SignupForm>({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const j: { error?: string } = await res.json().catch(() => ({}));
                throw new Error(j?.error || "Sign up failed");
            }

            await signIn("credentials", {
                email: form.email,
                password: form.password,
                callbackUrl: "/",
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sign up failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>

                {/* Social sign-in */}
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

                {/* Email/password form */}
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full name"
                        required
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition hover:bg-black disabled:opacity-60"
                    >
                        {loading ? "Creating…" : "Sign up with email"}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-200">
                        Terms of Use
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-200">
                        Privacy Policy
                    </a>.
                </p>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>

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
