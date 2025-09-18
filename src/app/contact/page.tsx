// src/app/contact/page.tsx
"use client";

import { useState } from "react";

type FormState = {
    name: string;
    email: string;
    subject: string;
    message: string;
    website: string; // honeypot
};

export default function ContactPage() {
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
    });
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState<null | boolean>(null);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setOk(null);
        setLoading(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(form),
            });

            const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Something went wrong.");

            setOk(true);
            setForm({ name: "", email: "", subject: "", message: "", website: "" });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send message.";
            setOk(false);
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setOk(null);
        setError(null);
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid gap-10 md:grid-cols-5">
                {/* Left: Contact info */}
                <aside className="md:col-span-2 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contact</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Questions, feedback, partnership ideas? Drop us a note and we’ll get back to you.
                    </p>

                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email</h2>
                            <a href="mailto:hello@transparency.jobs" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                                hello@transparency.jobs
                            </a>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">GitHub</h2>
                            <a
                                href="https://github.com/zadehsena/transparency"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                github.com/zadehsena/transparency
                            </a>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">X / Twitter</h2>
                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                @transparency
                            </a>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-gray-100">Response time</p>
                        <p>We typically respond within 1–2 business days.</p>
                    </div>
                </aside>

                {/* Right: Form */}
                <section className="md:col-span-3">
                    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {/* Honeypot (hidden) */}
                        <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.website}
                            onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                            className="hidden"
                            aria-hidden="true"
                        />

                        {/* Status banners */}
                        <div aria-live="polite" className="space-y-2">
                            {ok && (
                                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/30 dark:text-green-200">
                                    Thanks! Your message has been sent.
                                </div>
                            )}
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                                Subject
                            </label>
                            <input
                                id="subject"
                                type="text"
                                required
                                value={form.subject}
                                onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={6}
                                value={form.message}
                                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={loading}
                                className="rounded-lg border px-4 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-900 disabled:opacity-60"
                            >
                                {loading ? "Sending…" : "Send message"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
