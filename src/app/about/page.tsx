// src/app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About — Transparency",
    description: "Learn about Transparency, the job listings platform with real response rates.",
};

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Transparency</h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Transparency is a platform built to make the job search fairer and less stressful.
                We show you not only open positions, but also real insights into how often companies
                actually respond to applicants. No more applying into the void.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
                    <p className="text-gray-700 leading-relaxed">
                        We want to empower job seekers with the data they need to make smarter decisions.
                        By surfacing response rates and patterns across industries, we help candidates focus
                        on opportunities that are worth their time.
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>
                    <p className="text-gray-700 leading-relaxed">
                        We pull job postings from popular ATS platforms like Greenhouse and Lever,
                        combine them with user-submitted application data, and provide a transparent
                        view into the hiring funnel. All data is anonymized and aggregated.
                    </p>
                </div>
            </div>

            <div className="mt-12 rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">The Team</h2>
                <p className="text-gray-700 leading-relaxed">
                    Transparency was started by engineers who’ve been through the painful job search
                    process themselves. We know how discouraging the black hole of applications can be,
                    and we’re building the tool we wish we had.
                </p>
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-600">
                    Have questions?{" "}
                    <a
                        href="/contact"
                        className="text-gray-900 font-medium hover:underline"
                    >
                        Get in touch
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
