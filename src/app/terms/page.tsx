// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service — Transparency",
    description:
        "Read the terms of service for Transparency. Understand your rights, responsibilities, and how you can use our platform.",
};

const LAST_UPDATED = "September 15, 2025";

export default function TermsPage() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Terms of Service
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {LAST_UPDATED}
                </p>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Welcome to Transparency. By accessing or using our website and services (the “Services”), you agree to these Terms of
                    Service (“Terms”). If you do not agree to these Terms, you may not use the Services. Please also review our{" "}
                    <Link href="/privacy" className="underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>

            {/* TOC */}
            <nav className="mb-10 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
                <div className="mb-2 text-lg font-bold text-white">Contents</div>
                <ul className="grid gap-2 sm:grid-cols-2 text-sm">
                    {[
                        ["Eligibility", "#eligibility"],
                        ["Accounts", "#accounts"],
                        ["Acceptable Use", "#acceptable-use"],
                        ["User Content & License", "#user-content"],
                        ["Feedback", "#feedback"],
                        ["Data & Privacy", "#privacy"],
                        ["Third-Party Services", "#third-parties"],
                        ["Service Availability & Changes", "#availability"],
                        ["Beta Features", "#beta"],
                        ["Paid Features & Billing", "#billing"],
                        ["Intellectual Property", "#ip"],
                        ["Disclaimer", "#disclaimer"],
                        ["Limitation of Liability", "#limitation"],
                        ["Indemnification", "#indemnification"],
                        ["DMCA / IP Complaints", "#dmca"],
                        ["Suspension & Termination", "#termination"],
                        ["Governing Law", "#governing-law"],
                        ["Changes to These Terms", "#changes"],
                        ["Contact", "#contact"],
                    ].map(([label, href]) => (
                        <li key={href}>
                            <Link href={href} className="text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="space-y-6">
                {/* Eligibility */}
                <Card id="eligibility" title="Eligibility">
                    <p>
                        You must be at least 13 years old (or the age of majority in your jurisdiction, if higher) to use the Services.
                        By using the Services, you represent and warrant that you meet this requirement and that you have the legal capacity
                        to enter into these Terms.
                    </p>
                </Card>

                {/* Accounts */}
                <Card id="accounts" title="Accounts">
                    <ul className="list-inside list-disc space-y-2">
                        <li>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</li>
                        <li>You must provide accurate, complete information and keep it current.</li>
                        <li>We may suspend or terminate your account for any violation of these Terms or to protect the Services or other users.</li>
                    </ul>
                </Card>

                {/* Acceptable Use */}
                <Card id="acceptable-use" title="Acceptable Use">
                    <p className="mb-3">You agree not to, and will not assist or enable others to:</p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Use the Services for unlawful, infringing, or harmful purposes.</li>
                        <li>Access, tamper with, or use non-public areas or systems without authorization.</li>
                        <li>Probe, scan, or test the vulnerability of any system or network, or breach security or authentication measures.</li>
                        <li>Interfere with or disrupt any user, host, or network (e.g., DDoS, overloading, flooding, spamming, mail-bombing).</li>
                        <li>Scrape, crawl, harvest, or otherwise extract data without our prior written consent, including for resale or competing services.</li>
                        <li>Reverse engineer or attempt to derive source code or underlying ideas from the Services, except as permitted by law.</li>
                        <li>Misrepresent your affiliation or impersonate any person or entity.</li>
                    </ul>
                </Card>

                {/* User Content & License */}
                <Card id="user-content" title="User Content & License">
                    <p className="mb-3">
                        You may submit content to the Services, including application data, comments, company tags, or other materials
                        (“User Content”). You retain ownership of your User Content.
                    </p>
                    <p className="mb-3">
                        By submitting User Content, you grant Transparency a worldwide, non-exclusive, royalty-free license to host, store,
                        reproduce, modify, create derivative works (e.g., formatting or analytics), publicly display, and distribute such
                        content solely to operate, improve, and provide the Services. This license ends when you delete your User Content
                        from the Services, except: (i) to the extent your content has been shared with others and they have not deleted it;
                        or (ii) where retention is required for legal, compliance, or audit purposes.
                    </p>
                    <p>
                        You represent and warrant that you have all rights necessary to submit the User Content and grant the above license,
                        and that your User Content does not violate law or any third-party rights (including privacy and intellectual
                        property rights).
                    </p>
                </Card>

                {/* Feedback */}
                <Card id="feedback" title="Feedback">
                    <p>
                        If you provide ideas, suggestions, or feedback, you grant us a perpetual, worldwide, irrevocable,
                        royalty-free license to use it without restriction or compensation to you.
                    </p>
                </Card>

                {/* Data & Privacy */}
                <Card id="privacy" title="Data & Privacy">
                    <p>
                        Our processing of personal information is described in our{" "}
                        <Link href="/privacy" className="underline">
                            Privacy Policy
                        </Link>
                        . You agree that we may process your information as described there.
                    </p>
                </Card>

                {/* Third-Party Services */}
                <Card id="third-parties" title="Third-Party Services">
                    <p>
                        The Services may link to or integrate with third-party services (e.g., single sign-on, analytics, ATS providers).
                        Your use of third-party services is governed by their terms and privacy policies, not ours. We are not responsible
                        for third-party services.
                    </p>
                </Card>

                {/* Service Availability & Changes */}
                <Card id="availability" title="Service Availability & Changes">
                    <ul className="list-inside list-disc space-y-2">
                        <li>The Services are provided on an “as available” basis and may change without notice.</li>
                        <li>We may modify, suspend, or discontinue any part of the Services at any time, including features and content.</li>
                        <li>We may impose or change limits on usage (e.g., rate limits, storage, API calls) to ensure platform stability.</li>
                    </ul>
                </Card>

                {/* Beta Features */}
                <Card id="beta" title="Beta Features">
                    <p>
                        We may offer early access or beta features. Beta features are provided “as is,” may be modified or discontinued
                        at any time, and may be subject to additional terms. They may be less reliable or secure than generally available features.
                    </p>
                </Card>

                {/* Paid Features & Billing (optional; safe placeholder if/when you add billing) */}
                <Card id="billing" title="Paid Features & Billing">
                    <p className="mb-3">
                        Certain features may require payment. Prices, taxes, and billing terms will be disclosed at the point of purchase.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Unless stated otherwise, fees are non-refundable.</li>
                        <li>Subscriptions auto-renew unless cancelled as described in the purchase flow.</li>
                        <li>We may change pricing with prior notice for subsequent billing periods.</li>
                    </ul>
                </Card>

                {/* Intellectual Property */}
                <Card id="ip" title="Intellectual Property">
                    <p>
                        The Services, including text, graphics, logos, software, and other materials (excluding User Content), are
                        owned by Transparency or its licensors and are protected by intellectual property laws. No rights are granted
                        except as expressly set forth in these Terms.
                    </p>
                </Card>

                {/* Disclaimer */}
                <Card id="disclaimer" title="Disclaimer">
                    <p>
                        THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED,
                        OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY.
                        We do not guarantee job outcomes, the accuracy of third-party data, or uninterrupted service.
                    </p>
                </Card>

                {/* Limitation of Liability */}
                <Card id="limitation" title="Limitation of Liability">
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRANSPARENCY AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT
                        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                        PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF (OR INABILITY
                        TO USE) THE SERVICES. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES SHALL NOT EXCEED THE GREATER
                        OF (A) THE AMOUNTS PAID BY YOU TO TRANSPARENCY IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $100.
                    </p>
                </Card>

                {/* Indemnification */}
                <Card id="indemnification" title="Indemnification">
                    <p>
                        You agree to defend, indemnify, and hold harmless Transparency and its affiliates, officers, employees, and agents
                        from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys’ fees)
                        arising out of or related to your User Content, your use of the Services, or your violation of these Terms.
                    </p>
                </Card>

                {/* DMCA / IP Complaints */}
                <Card id="dmca" title="DMCA / IP Complaints">
                    <p className="mb-3">
                        If you believe content on the Services infringes your copyright or other intellectual property rights,
                        please contact us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>{" "}
                        with: (i) identification of the work claimed to be infringed; (ii) identification of the infringing material and
                        its location; (iii) your contact information; (iv) a statement that you have a good-faith belief the use is not
                        authorized; (v) a statement, under penalty of perjury, that the information is accurate and that you are the
                        rights holder or authorized to act on their behalf; and (vi) your physical or electronic signature.
                    </p>
                    <p>
                        We may remove or disable access to the identified material and may terminate repeat infringers’ accounts where appropriate.
                    </p>
                </Card>

                {/* Suspension & Termination */}
                <Card id="termination" title="Suspension & Termination">
                    <p>
                        We may suspend or terminate your access to the Services at any time, with or without notice, including if we believe
                        you have violated these Terms or to protect the Services or other users. Upon termination, your right to use the
                        Services will cease immediately. Sections that by their nature should survive (e.g., IP, disclaimers, limitation
                        of liability, indemnification, governing law) will survive termination.
                    </p>
                </Card>

                {/* Governing Law */}
                <Card id="governing-law" title="Governing Law">
                    <p>
                        These Terms are governed by the laws of the State of North Carolina, USA, without regard to its conflict of laws rules.
                        You agree to the exclusive jurisdiction and venue of the state and federal courts located in Wake County, North Carolina,
                        for any dispute that is not subject to arbitration or cannot be filed in small-claims court.
                    </p>
                </Card>

                {/* Changes */}
                <Card id="changes" title="Changes to These Terms">
                    <p>
                        We may update these Terms from time to time. If we make material changes, we will provide notice (e.g., by updating
                        the “Last updated” date, posting a notice in-product, or sending an email). Your continued use of the Services after
                        changes become effective constitutes acceptance of the updated Terms.
                    </p>
                </Card>

                {/* Contact */}
                <Card id="contact" title="Contact">
                    <p>
                        Questions about these Terms? Email us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
                </Card>

                {/* Back to top */}
                <div className="pt-2">
                    <Link href="#top" className="text-sm underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                        Back to top
                    </Link>
                </div>
            </div>
        </section>
    );
}

/** Simple card component to match home page styling */
function Card({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80"
        >
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300">
                {children}
            </div>
        </section>
    );
}
