// src/app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — Transparency",
    description:
        "Read the terms of service for Transparency. Understand your rights, responsibilities, and how you can use our platform.",
};

const LAST_UPDATED = "September 15, 2025";

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mb-8 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

            <div className="space-y-8 text-gray-700">
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="leading-relaxed">
                        Welcome to Transparency. By accessing or using our website and services, you agree to
                        these Terms of Service (“Terms”). Please read them carefully. If you do not agree, you
                        may not use Transparency.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Eligibility</h2>
                    <p className="leading-relaxed">
                        You must be at least 13 years old (or the age of majority in your jurisdiction) to use
                        Transparency. By using our services, you represent that you meet this requirement.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Use of Service</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>You may use Transparency only for lawful purposes.</li>
                        <li>You may not interfere with or disrupt the platform.</li>
                        <li>
                            You may not copy, scrape, or resell data from Transparency without prior written
                            permission.
                        </li>
                        <li>You are responsible for the accuracy of any information you submit.</li>
                    </ul>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Accounts</h2>
                    <p className="leading-relaxed">
                        If you create an account, you are responsible for maintaining the confidentiality of
                        your login information and all activities under your account. We reserve the right to
                        suspend or terminate accounts that violate these Terms.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Intellectual Property</h2>
                    <p className="leading-relaxed">
                        Transparency and its content (excluding user-generated data) are protected by copyright,
                        trademark, and other laws. You may not use our name, logo, or content without our prior
                        consent.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Data & Privacy</h2>
                    <p className="leading-relaxed">
                        By using Transparency, you agree that we may process your information as described in
                        our{" "}
                        <a href="/privacy" className="font-medium text-gray-900 underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Disclaimer</h2>
                    <p className="leading-relaxed">
                        Transparency is provided “as is” without warranties of any kind. We do not guarantee job
                        outcomes, accuracy of third-party data, or uninterrupted service.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Limitation of Liability</h2>
                    <p className="leading-relaxed">
                        To the maximum extent permitted by law, Transparency shall not be liable for any
                        indirect, incidental, special, or consequential damages, including loss of data or
                        opportunities.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Changes to Terms</h2>
                    <p className="leading-relaxed">
                        We may update these Terms from time to time. Continued use of Transparency after changes
                        constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Governing Law</h2>
                    <p className="leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of your local
                        jurisdiction, without regard to its conflict of laws rules.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact</h2>
                    <p className="leading-relaxed">
                        If you have questions about these Terms, contact us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="font-medium text-gray-900 underline">
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
