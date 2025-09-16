// src/app/cookies/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookies Policy — Transparency",
    description:
        "Learn how Transparency uses cookies and similar technologies to improve your experience.",
};

const LAST_UPDATED = "September 15, 2025";

export default function CookiesPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Cookies Policy</h1>
            <p className="mb-8 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

            <div className="space-y-8 text-gray-700">
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="leading-relaxed">
                        Transparency (“we”, “us”, “our”) uses cookies and similar technologies to provide,
                        protect, and improve our service. This page explains what cookies are, how we use them,
                        and your choices.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">What Are Cookies?</h2>
                    <p className="leading-relaxed">
                        Cookies are small text files stored on your device when you visit a website. They allow
                        us to remember your preferences, keep you logged in, and understand how the site is
                        used.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Types of Cookies We Use</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Essential cookies:</span> Required for the site to
                            function (e.g., authentication, security). You cannot opt out of these.
                        </li>
                        <li>
                            <span className="font-medium">Preference cookies:</span> Remember your settings, such
                            as dark mode or language.
                        </li>
                        <li>
                            <span className="font-medium">Analytics cookies:</span> Help us understand traffic and
                            usage so we can improve the site. These are optional.
                        </li>
                    </ul>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Managing Cookies</h2>
                    <p className="leading-relaxed">
                        You can manage or disable cookies through your browser settings. Note that blocking
                        essential cookies may cause parts of Transparency to stop working.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Third-Party Cookies</h2>
                    <p className="leading-relaxed">
                        Some features may rely on third-party providers (e.g., analytics, authentication). These
                        providers may set their own cookies, subject to their privacy policies.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Updates</h2>
                    <p className="leading-relaxed">
                        We may update this Cookies Policy from time to time. The date above shows the latest
                        revision.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact</h2>
                    <p className="leading-relaxed">
                        Questions about this Cookies Policy? Email{" "}
                        <a
                            href="mailto:hello@transparency.jobs"
                            className="font-medium text-gray-900 underline"
                        >
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
