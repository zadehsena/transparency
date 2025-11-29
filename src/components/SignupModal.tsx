"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

type SignupForm = {
    name: string;
    email: string;
    password: string;
};

type PasswordReqs = {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
};

function validatePassword(pw: string): PasswordReqs {
    return {
        length: pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        lower: /[a-z]/.test(pw),
        number: /[0-9]/.test(pw),
    };
}

function AllGood(reqs: PasswordReqs) {
    return reqs.length && reqs.upper && reqs.lower && reqs.number;
}

export default function SignupModal({
    onClose,
    onRequestLogin,
}: {
    onClose: () => void;
    onRequestLogin?: () => void;
}) {
    const [form, setForm] = useState<SignupForm>({
        name: "",
        email: "",
        password: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reqs = useMemo(() => validatePassword(form.password), [form.password]);
    const canSubmit = !loading && AllGood(reqs) && !!form.email;

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!AllGood(reqs)) return;

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
                callbackUrl: "/onboarding",
            });
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sign up failed";
            setError(msg);
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    {/* LEFT: existing signup form */}
                    <div className="w-full md:w-1/2 p-8">
                        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Create your account
                        </h2>

                        <form onSubmit={onSubmit} className="space-y-4" noValidate>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, email: e.target.value }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />

                            {/* Password with show/hide */}
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    aria-describedby="pw-help"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((s) => ({
                                            ...s,
                                            password: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                >
                                    {showPw ? "Hide" : "Show"}
                                </button>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="w-full rounded-lg border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Creating…" : "Sign up with email"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                            <span className="px-3 text-sm text-gray-500">or</span>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Social sign-in */}
                        <div className="space-y-3">
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/" })}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {/* Google logo */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fill="#EA4335"
                                        d="M24 9.5c3.54 0 6.71 1.22 9.22 3.6l6.85-6.85C35.9 2.7 30.47 0 24 0 14.62 0 6.47 5.38 2.55 13.22l7.98 6.19C12.1 13.02 17.62 9.5 24 9.5z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M46.1 24.5c0-1.59-.14-3.12-.41-4.59H24v9.18h12.5c-.54 2.89-2.19 5.34-4.66 6.98l7.18 5.57C43.73 37.33 46.1 31.36 46.1 24.5z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M10.53 28.41c-1.1-3.29-1.1-6.82 0-10.11l-7.98-6.19c-3.36 6.73-3.36 14.78 0 21.51l7.98-6.21z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M24 48c6.48 0 11.91-2.14 15.88-5.81l-7.18-5.57c-2.02 1.36-4.62 2.16-8.7 2.16-6.38 0-11.9-3.52-14.47-8.69l-7.98 6.21C6.47 42.62 14.62 48 24 48z"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {/* Microsoft logo */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    className="h-5 w-5"
                                >
                                    <path fill="#F25022" d="M23 23H4V4h19v19z" />
                                    <path fill="#7FBA00" d="M44 23H25V4h19v19z" />
                                    <path fill="#00A4EF" d="M23 44H4V25h19v19z" />
                                    <path fill="#FFB900" d="M44 44H25V25h19v19z" />
                                </svg>
                                Continue with Outlook
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                            By continuing, you agree to our{" "}
                            <a
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Terms of Use
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>

                        {/* Switch to login */}
                        <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={onRequestLogin}
                                className="font-medium underline hover:text-gray-800 dark:hover:text-white"
                            >
                                Log in
                            </button>
                        </p>
                    </div>

                    {/* RIGHT: image side (matches LoginModal sizing) */}
                    <div className="hidden md:block md:w-1/2 bg-gray-900 text-white">
                        <div className="relative h-full w-full min-h-[360px]">
                            <Image
                                src="/images/void.png" // or a dedicated signup illustration
                                alt="Job applications and response rates"
                                fill
                                className="object-cover opacity-90"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="mb-2 text-xl font-semibold">
                                    Start tracking your search.
                                </h3>
                                <p className="text-sm text-gray-200 max-w-xs">
                                    Create a free Transparency account to track your apps,
                                    see real response rates, and stop applying into the void.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
