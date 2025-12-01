import React from "react";
import Image from "next/image";

function fmtEmployees(low?: number | null, high?: number | null) {
    if (low && high) return `${low.toLocaleString()}–${high.toLocaleString()}`;
    if (high) return `~${high.toLocaleString()}`;
    if (low) return `~${low.toLocaleString()}`;
    return "—";
}

function fmtHeadquarters(city?: string | null, country?: string | null) {
    const parts: string[] = [];
    if (city) parts.push(city);
    if (country) parts.push(country);
    return parts.length ? parts.join(", ") : "—";
}

export default function CompanySummary({
    name,
    hqCity,
    hqCountry,
    employeesLow,
    employeesHigh,
    foundedYear,
    domain,
    industry,
    linkedinUrl,
    twitterUrl,
}: {
    name: string;
    hqCity?: string | null;
    hqCountry?: string | null;
    employeesLow?: number | null;
    employeesHigh?: number | null;
    foundedYear?: number | null;
    domain?: string | null;
    industry?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
}) {
    const website =
        domain && !/^https?:\/\//i.test(domain) ? `https://${domain}` : domain || "";

    // For now: everything falls back to website so all icons show
    const websiteHref = website || "#";
    const linkedinHref = linkedinUrl || websiteHref;
    const twitterHref = twitterUrl || websiteHref;

    return (
        <section className="relative rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            {/* HEADER + SOCIAL ICONS */}
            <div className="mb-4 flex items-center">
                <div className="text-lg font-bold text-white">Company overview</div>

                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <a href={websiteHref} target="_blank" rel="noreferrer">
                        <Image
                            src="/images/social/website.png"
                            alt="Website"
                            width={20}
                            height={20}
                            className="h-5 w-5 opacity-80 hover:opacity-100 transition"
                        />
                    </a>

                    <a href={linkedinHref} target="_blank" rel="noreferrer">
                        <Image
                            src="/images/social/linkedIn.png"
                            alt="LinkedIn"
                            width={20}
                            height={20}
                            className="h-5 w-5 opacity-80 hover:opacity-100 transition"
                        />
                    </a>

                    <a href={twitterHref} target="_blank" rel="noreferrer">
                        <Image
                            src="/images/social/x.png"
                            alt="X"
                            width={20}
                            height={20}
                            className="h-5 w-5 opacity-80 hover:opacity-100 transition"
                        />
                    </a>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                        Headquarters
                    </div>
                    <div className="text-sm text-gray-200">
                        {fmtHeadquarters(hqCity, hqCountry)}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                        Employees
                    </div>
                    <div className="text-sm text-gray-200">
                        {fmtEmployees(employeesLow, employeesHigh)}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                        Founded
                    </div>
                    <div className="text-sm text-gray-200">{foundedYear ?? "—"}</div>
                </div>

                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                        Industry
                    </div>
                    <div className="text-sm text-gray-200">{industry || "—"}</div>
                </div>
            </div>
        </section>
    );
}
