// app/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" }); // 'website' = honeypot
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState<null | boolean>(null);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
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
            const data = await res.json().catch(() => ({}));

            if (!res.ok) throw new Error(data?.error || "Something went wrong.");
            setOk(true);
            setForm({ name: "", email: "", subject: "", message: "", website: "" });
        } catch (err: any) {
            setOk(false);
            setError(err.message || "Failed to send message.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid gap-10 md:grid-cols-5">
                {/* Left: Contact info */}
                <aside className="md:col-span-2 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
                    <p className="text-gray-600">
                        Questions, feedback, partnership ideas? Drop us a note and we’ll get back to you.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Email</h2>
                            <a href="mailto:hello@transparency.jobs" className="text-gray-600 hover:text-gray-900">
                                hello@transparency.jobs
                            </a>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">GitHub</h2>
                            <a
                                href="https://github.com/zadehsena/transparency"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                github.com/zadehsena/transparency
                            </a>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">X / Twitter</h2>
                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                @transparency
                            </a>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">Response time</p>
                        <p>We typically respond within 1–2 business days.</p>
                    </div>
                </aside>

                {/* Right: Form */}
                <section className="md:col-span-3">
                    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
                        {/* Honeypot (hidden) */}
                        <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.website}
                            onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                            className="hidden"
                            aria-hidden="true"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-800">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-800">
                                Subject
                            </label>
                            <input
                                id="subject"
                                type="text"
                                required
                                value={form.subject}
                                onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-800">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={6}
                                value={form.message}
                                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            />
                        </div>

                        {ok && <p className="text-sm text-green-600">Thanks! Your message has been sent.</p>}
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setOk(null);
                                    setError(null);
                                    setForm({ name: "", email: "", subject: "", message: "", website: "" });
                                }}
                                className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-60"
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
