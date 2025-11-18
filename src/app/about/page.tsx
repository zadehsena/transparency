// src/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About — Transparency",
    description: "Learn about Transparency, the job listings platform with real response rates.",
};

export default function AboutPage() {
    return (
        <section id="top" className="mx-auto max-w-6xl px-6 py-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    About Transparency
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Our goal is simple: help job seekers use{" "}
                    <span className="font-semibold">real data and stats behind companies and openings</span>{" "}
                    to accelerate their hunt and find the best opportunities—without guessing, doom-applying,
                    or wasting time on black-hole postings.
                </p>
            </div>

            {/* Quick nav */}
            <nav className="mb-10 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
                <div className="mb-2 text-lg font-bold text-white">Contents</div>
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {[
                        ["Mission", "#mission"],
                        ["What We Do", "#what-we-do"],
                        ["How It Works", "#how-it-works"],
                        ["Who It Helps", "#who-it-helps"],
                        ["Data Ethics & Privacy", "#ethics"],
                        ["Accuracy & Limitations", "#accuracy"],
                        ["Roadmap", "#roadmap"],
                        ["FAQs", "#faqs"],
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
                <Card id="mission" title="Our Mission">
                    <p>
                        We believe a fairer job market starts with transparency. By surfacing response rates, hiring
                        velocity, and patterns across companies and roles, we help you prioritize the applications
                        most likely to move—and spend less energy on those that don’t.
                    </p>
                </Card>

                <Card id="what-we-do" title="What We Do">
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Show real signals:</span> company-level response rates, median time to respond,
                            and trending interest from job seekers.
                        </li>
                        <li>
                            <span className="font-medium">Contextualize openings:</span> not just “what’s open,” but{" "}
                            <em>how often</em> applicants hear back.
                        </li>
                        <li>
                            <span className="font-medium">Help you focus:</span> cut through noise and aim your time where it has the best odds.
                        </li>
                    </ul>
                </Card>

                <Card id="how-it-works" title="How It Works">
                    <p className="mb-3">
                        We combine multiple inputs to build an aggregated, privacy-respecting picture of hiring activity:
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <span className="font-medium">Job sources:</span> openings from popular ATS platforms (e.g., Greenhouse) and curated feeds.
                        </li>
                        <li>
                            <span className="font-medium">Application signals:</span> anonymous, user-submitted outcomes (e.g., no response, recruiter reply, interview, offer).
                        </li>
                        <li>
                            <span className="font-medium">Engagement patterns:</span> trends in searches and company interest on our platform.
                        </li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        All personal data is aggregated and anonymized before it ever appears in public stats.
                        See our <Link href="/privacy" className="underline">Privacy Policy</Link> for details.
                    </p>
                </Card>

                <Card id="who-it-helps" title="Who It Helps">
                    <ul className="list-inside list-disc space-y-2">
                        <li><span className="font-medium">Active applicants:</span> prioritize high-signal postings and avoid low-yield cycles.</li>
                        <li><span className="font-medium">Career switchers & grads:</span> target companies/units that actually reply.</li>
                        <li><span className="font-medium">Time-boxed seekers:</span> maximize traction in limited application windows.</li>
                    </ul>
                </Card>

                <Card id="ethics" title="Data Ethics & Privacy">
                    <ul className="list-inside list-disc space-y-2">
                        <li>We aggregate and anonymize outcome data before it appears in any metric.</li>
                        <li>We do <span className="font-semibold">not</span> sell personal information.</li>
                        <li>We provide clear controls and respect deletion requests.</li>
                    </ul>
                    <p className="mt-3">
                        Read the <Link href="/privacy" className="underline">Privacy Policy</Link> for a full breakdown of what we collect and why.
                    </p>
                </Card>

                <Card id="accuracy" title="Accuracy & Limitations">
                    <p className="mb-3">
                        Transparency reflects <em>observed</em> activity and user-reported outcomes. While we work to keep data fresh and representative,
                        some postings change rapidly, and not all applicants report results. Treat our stats as a decision aid—one useful signal among many.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>Metrics may vary by business unit, role, and region.</li>
                        <li>Sample sizes matter: small n can under- or over-represent reality.</li>
                        <li>We continuously tune thresholds and de-biasing rules to improve signal quality.</li>
                    </ul>
                </Card>

                <Card id="roadmap" title="Roadmap (What’s Next)">
                    <ul className="list-inside list-disc space-y-2">
                        <li>Deeper role-level insights and business-unit breakouts.</li>
                        <li>Personal trackers with smart reminders and auto-parsing of application emails.</li>
                        <li>Company transparency badges and verified employer responses.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Want to influence the roadmap?{" "}
                        <Link href="/contact" className="underline">Tell us what would help most</Link>.
                    </p>
                </Card>

                <Card id="faqs" title="FAQs">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Do you share individual applicant data?</h3>
                            <p>No. Public stats are aggregated and anonymized. Individual identities and application details aren’t exposed.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Will this guarantee interviews or offers?</h3>
                            <p>No platform can guarantee outcomes. We provide directional signal so you can allocate effort more effectively.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">How often are metrics updated?</h3>
                            <p>Continuously, as we ingest new postings and user-reported outcomes. Some metrics are windowed (e.g., 7–90 days).</p>
                        </div>
                    </div>
                </Card>

                <Card id="contact" title="Contact">
                    <p>
                        Media or partnership inquiries? Feedback or feature requests?
                        Reach us at{" "}
                        <a href="mailto:hello@transparency.jobs" className="underline">
                            hello@transparency.jobs
                        </a>
                        . You can also review our{" "}
                        <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
                        <Link href="/privacy" className="underline">Privacy Policy</Link>.
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
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300">
                {children}
            </div>
        </section>
    );
}
