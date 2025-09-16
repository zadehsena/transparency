import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Transparency",
    description:
        "Learn how Transparency collects, uses, and protects your data. We value your privacy and explain your rights here.",
};

const LAST_UPDATED = "September 15, 2025";

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mb-8 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

            <div className="space-y-8 text-gray-700">
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="leading-relaxed">
                        Transparency (“we”, “us”, or “our”) is committed to protecting your privacy. This policy
                        explains what we collect, how we use it, and the choices you have. By using Transparency,
                        you agree to this policy.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Information We Collect</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Account data:</span> name, email, hashed password (if you
                            use credentials-based login), and profile preferences.
                        </li>
                        <li>
                            <span className="font-medium">Auth & identity:</span> if you use Google or Outlook (Azure
                            AD), we receive basic profile info from your provider as permitted.
                        </li>
                        <li>
                            <span className="font-medium">Usage data:</span> pages visited, actions (e.g., searches,
                            saved items), device info, approximate location inferred from IP, and timestamps.
                        </li>
                        <li>
                            <span className="font-medium">Contact messages:</span> messages you send via the contact
                            form (name, email, subject, message).
                        </li>
                        <li>
                            <span className="font-medium">Application insights:</span> optional, user-submitted
                            information about job applications (e.g., response outcomes) that you choose to share.
                        </li>
                        <li>
                            <span className="font-medium">Cookies & similar tech:</span> to keep you logged in,
                            remember preferences, and measure traffic.
                        </li>
                    </ul>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">How We Use Information</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Provide, secure, and maintain the service (authentication, sessions, CSRF protection).</li>
                        <li>Improve features and reliability (analytics, debugging, performance monitoring).</li>
                        <li>Show aggregated insights such as response rates (never exposing your personal details).</li>
                        <li>Communicate with you (service updates, responses to messages, important notices).</li>
                        <li>Prevent abuse, fraud, and ensure compliance with our Terms.</li>
                    </ul>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Legal Bases (EEA/UK)</h2>
                    <p className="leading-relaxed">
                        We process personal data under: (i) performance of a contract (providing the service),
                        (ii) legitimate interests (improving and securing the service), and (iii) consent (where
                        required, e.g., certain cookies or marketing).
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Sharing & Disclosure</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Vendors:</span> trusted providers (e.g., hosting, logging,
                            email) that process data on our behalf under appropriate safeguards.
                        </li>
                        <li>
                            <span className="font-medium">Compliance:</span> to comply with law, enforce our terms, or
                            protect rights, safety, and security.
                        </li>
                        <li>
                            <span className="font-medium">Business transfers:</span> in a merger, acquisition, or asset
                            sale, data may be transferred under equivalent protections.
                        </li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600">
                        We do <span className="font-semibold">not</span> sell your personal information.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Cookies & Analytics</h2>
                    <p className="leading-relaxed">
                        We use cookies and similar technologies to keep you signed in and understand usage. You can
                        control cookies via your browser settings. If you block essential cookies, some features may
                        not work. We may use privacy-respecting analytics to measure traffic and improve the product.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Retention</h2>
                    <p className="leading-relaxed">
                        We retain personal data only as long as necessary for the purposes described above, unless a
                        longer retention is required by law. You may request deletion as described below.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Your Rights</h2>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Access, correction, deletion, and portability of your personal data.</li>
                        <li>Objection and restriction to certain processing (where applicable).</li>
                        <li>Withdrawal of consent where processing is based on consent.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        To exercise rights, contact us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="font-medium text-gray-900 underline">
                            hello@transparency.jobs
                        </a>
                        . We may need to verify your identity to process requests.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Security</h2>
                    <p className="leading-relaxed">
                        We use reasonable technical and organizational measures to protect your data. However, no
                        internet service can be 100% secure.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">International Transfers</h2>
                    <p className="leading-relaxed">
                        If we transfer your data across borders, we use appropriate safeguards (e.g., SCCs) where
                        required by law.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Children’s Privacy</h2>
                    <p className="leading-relaxed">
                        Transparency is not directed to children under 13 (or the minimum age in your jurisdiction).
                        We do not knowingly collect personal data from children.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Changes to This Policy</h2>
                    <p className="leading-relaxed">
                        We may update this policy from time to time. We’ll post the new effective date and, if
                        changes are significant, provide additional notice.
                    </p>
                </section>

                <section className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact</h2>
                    <p className="leading-relaxed">
                        Questions about this policy? Email{" "}
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
