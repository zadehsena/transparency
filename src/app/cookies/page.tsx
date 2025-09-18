// src/app/cookies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cookies Policy — Transparency",
    description:
        "Learn how Transparency uses cookies and similar technologies to improve your experience.",
};

const LAST_UPDATED = "September 15, 2025";

export default function CookiesPage() {
    return (
        <section id="top" className="mx-auto max-w-6xl px-6 py-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Cookies Policy
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {LAST_UPDATED}
                </p>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Transparency (“we”, “us”, “our”) uses cookies and similar technologies
                    to provide, protect, and improve our service. This page explains what
                    cookies are, how we use them, and your choices.
                </p>
            </div>

            {/* TOC */}
            <nav className="mb-10 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
                <div className="mb-2 text-lg font-bold text-white">Contents</div>
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {[
                        ["What Are Cookies?", "#what-are-cookies"],
                        ["Types of Cookies We Use", "#types"],
                        ["Managing Cookies", "#managing"],
                        ["Third-Party Cookies", "#third-party"],
                        ["Updates", "#updates"],
                        ["Contact", "#contact"],
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
                <Card id="what-are-cookies" title="What Are Cookies?">
                    <p>
                        Cookies are small text files stored on your device when you visit a
                        website. They allow us to remember your preferences, keep you logged
                        in, and understand how the site is used. Some cookies are essential
                        to make the site function, while others improve your experience.
                    </p>
                </Card>

                <Card id="types" title="Types of Cookies We Use">
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Essential cookies:</span> Required
                            for the site to function (e.g., authentication, security). You
                            cannot opt out of these.
                        </li>
                        <li>
                            <span className="font-medium">Preference cookies:</span> Remember
                            your settings, such as dark mode or language.
                        </li>
                        <li>
                            <span className="font-medium">Analytics cookies:</span> Help us
                            understand traffic and usage so we can improve the site. These are
                            optional.
                        </li>
                    </ul>
                </Card>

                <Card id="managing" title="Managing Cookies">
                    <p className="mb-3">
                        You can manage or disable cookies through your browser settings:
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Block or delete cookies in your browser preferences.</li>
                        <li>Opt out of analytics cookies where tools provide options.</li>
                        <li>
                            Note: blocking essential cookies may cause some features of
                            Transparency to stop working.
                        </li>
                    </ul>
                </Card>

                <Card id="third-party" title="Third-Party Cookies">
                    <p>
                        Some features may rely on third-party providers (e.g., analytics,
                        authentication, or embedded content). These providers may set their
                        own cookies, subject to their privacy policies. We encourage you to
                        review those policies directly.
                    </p>
                </Card>

                <Card id="updates" title="Updates">
                    <p>
                        We may update this Cookies Policy from time to time. The “Last
                        updated” date above shows the latest revision. If changes are
                        material, we will provide additional notice (e.g., banner or email).
                    </p>
                </Card>

                <Card id="contact" title="Contact">
                    <p>
                        Questions about this Cookies Policy? Email us at{" "}
                        <a
                            href="mailto:hello@transparency.jobs"
                            className="underline font-medium"
                        >
                            hello@transparency.jobs
                        </a>
                        .
                    </p>
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
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300">
                {children}
            </div>
        </section>
    );
}
