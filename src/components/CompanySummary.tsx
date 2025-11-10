// src/components/CompanySummary.tsx
import React from "react";

function fmtEmployees(low?: number | null, high?: number | null) {
    if (low && high) return `${low.toLocaleString()}–${high.toLocaleString()}`;
    if (high) return `~${high.toLocaleString()}`;
    if (low) return `~${low.toLocaleString()}`;
    return "—";
}

export default function CompanySummary({
    name,
    hqCity,
    employeesLow,
    employeesHigh,
    foundedYear,
    domain,
}: {
    name: string;
    hqCity?: string | null;
    employeesLow?: number | null;
    employeesHigh?: number | null;
    foundedYear?: number | null;
    domain?: string;
}) {
    const pieces: string[] = [];
    if (hqCity) pieces.push(`headquartered in ${hqCity}`);
    if (employeesLow || employeesHigh) pieces.push(`employs ${fmtEmployees(employeesLow, employeesHigh)} people`);
    if (foundedYear) pieces.push(`founded in ${foundedYear}`);

    const summary =
        pieces.length > 0
            ? `${name} is ${pieces.join(", ")}.`
            : `We’re collecting more details about ${name}.`;

    const website =
        domain && !/^https?:\/\//i.test(domain) ? `https://${domain}` : domain || "";

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="mb-1 text-lg font-bold text-white">Company overview</div>
            <p className="mb-4 text-sm leading-6 text-gray-300">{summary}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Headquarters</div>
                    <div className="text-sm text-gray-200">{hqCity || "—"}</div>
                </div>
                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Employees</div>
                    <div className="text-sm text-gray-200">
                        {fmtEmployees(employeesLow, employeesHigh)}
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Founded</div>
                    <div className="text-sm text-gray-200">{foundedYear ?? "—"}</div>
                </div>
            </div>

            {website ? (
                <div className="mt-4 text-xs">
                    <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-300 underline decoration-gray-500 underline-offset-2 hover:text-white"
                    >
                        Visit website
                    </a>
                </div>
            ) : null}
        </section>
    );
}
