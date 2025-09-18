// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy — Transparency",
    description:
        "Learn how Transparency collects, uses, and protects your data. We value your privacy and explain your rights here.",
};

const LAST_UPDATED = "September 15, 2025";

export default function PrivacyPage() {
    return (
        <section id="top" className="mx-auto max-w-6xl px-6 py-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Privacy Policy
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: {LAST_UPDATED}</p>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Transparency (“<em>Transparency</em>”, “<em>we</em>”, “<em>us</em>”, or “<em>our</em>”) is committed to protecting your
                    privacy. This Policy explains what we collect, how we use it, with whom we share it, and your choices. By using our
                    website and services (the “<em>Services</em>”), you agree to this Policy. For information about your contractual
                    relationship with us, please also see our{" "}
                    <Link href="/terms" className="underline">
                        Terms of Service
                    </Link>
                    .
                </p>
            </div>

            {/* TOC */}
            <nav className="mb-10 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
                <div className="mb-2 text-lg font-bold text-white">Contents</div>
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {[
                        ["Who We Are & Scope", "#who-we-are"],
                        ["Information We Collect", "#information"],
                        ["Sources of Data", "#sources"],
                        ["How We Use Information", "#uses"],
                        ["Legal Bases (EEA/UK)", "#legal-bases"],
                        ["Sharing & Disclosure", "#sharing"],
                        ["Cookies, Analytics & Tracking", "#cookies"],
                        ["Your Choices", "#choices"],
                        ["Data Retention", "#retention"],
                        ["Security", "#security"],
                        ["International Transfers", "#transfers"],
                        ["Your Rights (EEA/UK & Others)", "#rights-gdpr"],
                        ["Your Rights (US/CCPA/CPRA)", "#rights-ccpa"],
                        ["Automated Decision-Making / Profiling", "#automated"],
                        ["Children’s Privacy", "#children"],
                        ["Changes to This Policy", "#changes"],
                        ["Contact", "#contact"],
                        ["Definitions", "#definitions"],
                    ].map(([label, href]) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className="text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="space-y-6">
                {/* Who we are */}
                <Card id="who-we-are" title="Who We Are & Scope">
                    <p className="mb-3">
                        This Policy applies to personal information processed by Transparency in connection with the Services. If you access
                        third-party services through our product (e.g., single sign-on providers or ATS tools), their privacy practices
                        are governed by their own policies.
                    </p>
                    <p>
                        You can contact us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
                </Card>

                {/* Information we collect */}
                <Card id="information" title="Information We Collect">
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Account data:</span> name, email, hashed password (if you use credentials-based login),
                            and profile preferences.
                        </li>
                        <li>
                            <span className="font-medium">Auth & identity:</span> if you sign in with Google or Outlook (Azure AD), we receive
                            basic profile details as permitted by your provider.
                        </li>
                        <li>
                            <span className="font-medium">Usage data:</span> pages visited, searches, saved items, device/browser info, approximate
                            location inferred from IP, and timestamps.
                        </li>
                        <li>
                            <span className="font-medium">Contact messages:</span> messages you send us (name, email, subject, message).
                        </li>
                        <li>
                            <span className="font-medium">Application insights:</span> optional, user-submitted information about job applications
                            (e.g., response outcomes) that you choose to share.
                        </li>
                        <li>
                            <span className="font-medium">Cookies & similar tech:</span> to keep you logged in, remember preferences, measure traffic,
                            and improve features.
                        </li>
                    </ul>
                </Card>

                {/* Sources */}
                <Card id="sources" title="Sources of Data">
                    <ul className="list-inside list-disc space-y-2">
                        <li>Directly from you (e.g., forms, profile settings, uploads, feedback).</li>
                        <li>Automatically from your device when you use the Services (see Cookies & Analytics).</li>
                        <li>From third parties you connect (e.g., identity providers) or public sources where appropriate.</li>
                    </ul>
                </Card>

                {/* Uses */}
                <Card id="uses" title="How We Use Information">
                    <ul className="list-inside list-disc space-y-2">
                        <li>Provide, secure, and maintain the Services (authentication, sessions, CSRF protection).</li>
                        <li>Improve features, reliability, and user experience (analytics, debugging, performance monitoring).</li>
                        <li>Generate aggregated insights such as response rates (we don’t expose your personal details).</li>
                        <li>Communicate with you (support responses, service updates, important notices).</li>
                        <li>Prevent abuse, fraud, and ensure compliance with our Terms and applicable law.</li>
                    </ul>
                </Card>

                {/* Legal bases */}
                <Card id="legal-bases" title="Legal Bases (EEA/UK)">
                    <p>
                        Where GDPR/UK GDPR applies, we process personal data under: (i){" "}
                        <span className="font-medium">performance of a contract</span> (providing and supporting the Services);
                        (ii) <span className="font-medium">legitimate interests</span> (improving and securing the Services, responding to your
                        requests); and (iii) <span className="font-medium">consent</span> (where required, e.g., certain cookies or marketing).
                    </p>
                </Card>

                {/* Sharing */}
                <Card id="sharing" title="Sharing & Disclosure">
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Vendors:</span> trusted providers (hosting, logging, analytics, email) that process data
                            on our behalf under appropriate safeguards.
                        </li>
                        <li>
                            <span className="font-medium">Compliance & safety:</span> to comply with law, enforce our terms, or protect rights,
                            safety, and security.
                        </li>
                        <li>
                            <span className="font-medium">Business transfers:</span> in a merger, acquisition, or asset sale, data may be transferred
                            subject to equivalent protections.
                        </li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        We do <span className="font-semibold">not</span> sell your personal information.
                    </p>
                </Card>

                {/* Cookies */}
                <Card id="cookies" title="Cookies, Analytics & Tracking">
                    <p className="mb-3">
                        We use cookies and similar technologies to keep you signed in, remember preferences, and understand usage. If you block
                        essential cookies, some features may not work. We may use privacy-respecting analytics to measure traffic and improve
                        the product.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li><span className="font-medium">Essential:</span> required for core functionality (auth/session, security).</li>
                        <li><span className="font-medium">Preferences:</span> remember settings like theme or layout.</li>
                        <li><span className="font-medium">Analytics:</span> help us understand usage patterns (aggregated reporting).</li>
                    </ul>
                </Card>

                {/* Choices */}
                <Card id="choices" title="Your Choices">
                    <ul className="list-inside list-disc space-y-2">
                        <li>Most browsers let you block or delete cookies; doing so may impact functionality.</li>
                        <li>You can disconnect third-party sign-in providers via your account with those providers.</li>
                        <li>You may opt out of non-essential communications where offered.</li>
                    </ul>
                </Card>

                {/* Retention */}
                <Card id="retention" title="Data Retention">
                    <p>
                        We retain personal data only as long as necessary for the purposes described here, unless a longer period is required
                        or permitted by law (e.g., tax, accounting, compliance). You may request deletion as described below.
                    </p>
                </Card>

                {/* Security */}
                <Card id="security" title="Security">
                    <p>
                        We use reasonable technical and organizational measures to protect your data. However, no internet service can be
                        100% secure.
                    </p>
                </Card>

                {/* Transfers */}
                <Card id="transfers" title="International Transfers">
                    <p>
                        If we transfer your data across borders, we rely on appropriate safeguards where required (e.g., Standard Contractual
                        Clauses) and take steps designed to ensure an adequate level of protection.
                    </p>
                </Card>

                {/* Rights (GDPR) */}
                <Card id="rights-gdpr" title="Your Rights (EEA/UK & Other Regions)">
                    <p className="mb-3">
                        Subject to applicable law, you may have the right to request: access, correction, deletion, restriction, portability,
                        and to object to certain processing. Where processing is based on consent, you can withdraw consent at any time.
                    </p>
                    <p>
                        To exercise rights, email{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>
                        . We may need to verify your identity before acting on your request. You may also have the right to lodge a complaint
                        with your local data protection authority.
                    </p>
                </Card>

                {/* Rights (CCPA/CPRA) */}
                <Card id="rights-ccpa" title="Your Rights (US — CCPA/CPRA)">
                    <p className="mb-3">
                        If you are a California resident, you may have the right to request: (i) access to specific pieces and categories of
                        personal information we have collected; (ii) deletion; (iii) correction; and (iv) information about our data practices.
                        You also have the right to not be discriminated against for exercising these rights.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>We do not sell or share your personal information as those terms are defined by the CCPA/CPRA.</li>
                        <li>
                            To submit a request, contact{" "}
                            <a href="mailto:hello@transparency.jobs" className="underline">
                                hello@transparency.jobs
                            </a>
                            . We will verify your request consistent with applicable law.
                        </li>
                    </ul>
                </Card>

                {/* Automated decisions */}
                <Card id="automated" title="Automated Decision-Making / Profiling">
                    <p>
                        We do not use automated decision-making that produces legal or similarly significant effects about you. We may create
                        aggregated analytics and insights to improve the Services; these do not identify you personally.
                    </p>
                </Card>

                {/* Children */}
                <Card id="children" title="Children’s Privacy">
                    <p>
                        The Services are not directed to children under 13 (or the minimum age in your jurisdiction). We do not knowingly
                        collect personal data from children.
                    </p>
                </Card>

                {/* Changes */}
                <Card id="changes" title="Changes to This Policy">
                    <p>
                        We may update this Policy from time to time. If changes are significant, we will provide additional notice (e.g.,
                        in-product, email). Your continued use of the Services after changes become effective constitutes acceptance of the
                        updated Policy.
                    </p>
                </Card>

                {/* Contact */}
                <Card id="contact" title="Contact">
                    <p>
                        Questions or requests regarding this Policy? Email{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
                </Card>

                {/* Definitions */}
                <Card id="definitions" title="Definitions">
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Personal information / personal data:</span> information that identifies, relates to, or
                            could reasonably be linked with an identified or identifiable individual.
                        </li>
                        <li>
                            <span className="font-medium">Processing:</span> any operation performed on personal information (e.g., collection,
                            storage, use, disclosure).
                        </li>
                        <li>
                            <span className="font-medium">Controller / Business:</span> the entity that determines the purposes and means of processing.
                        </li>
                        <li>
                            <span className="font-medium">Processor / Service Provider:</span> an entity that processes personal information on behalf
                            of the controller/business.
                        </li>
                    </ul>
                </Card>

                {/* Back to top */}
                <div className="pt-2">
                    <Link
                        href="#top"
                        className="text-sm underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    >
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
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300">{children}</div>
        </section>
    );
}
