// src/components/JobCard.tsx
"use client";

import { openAuthModal } from "@/lib/authModal";
import CompanyLogo from "@/components/CompanyLogo";
import Link from "next/link";

export type JobCardJob = {
    id: string;
    title: string;
    location: string;
    postedAt: string;       // ISO
    url?: string;
    unit?: string | null;
    companyName?: string | null;
};

export type JobCardStats = {
    initialRate: number | null;
    interviewRate: number | null;
    offerRate: number | null;
    medianDays: number | null;
} | null;

export default function JobCard({
    job,
    stats,
    isAuthed = true,
    descriptionHtml,
    isExpanded = false,
    onToggleDescription,
}: {
    job: JobCardJob;
    stats?: JobCardStats;
    isAuthed?: boolean;
    descriptionHtml?: string | null;
    isExpanded?: boolean;
    onToggleDescription?: () => void;
}) {
    const postedPretty = new Date(job.postedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <li
            className="group relative rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md cursor-pointer dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80"
            role={job.url ? "link" : undefined}
            tabIndex={job.url ? 0 : -1}
            onClick={() => {
                if (!job.url) return;
                window.open(job.url, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
                if (!job.url) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.open(job.url, "_blank", "noopener,noreferrer");
                }
            }}
        >

            {/* Top row: title/company/meta, right = stats */}
            <div className="flex items-start justify-between gap-4 relative">
                {/* LEFT */}
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100
               transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400
               group-hover:underline underline-offset-2 mb-1.5">
                        {job.title}
                    </h2>
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400
               overflow-hidden text-ellipsis whitespace-nowrap">
                        {job.companyName && (
                            <Link
                                href={`/company/${job.companyName.toLowerCase().replace(/\s+/g, "-")}`}
                                className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400
               hover:underline hover:text-blue-600 dark:hover:text-blue-400
               pointer-events-auto"
                                onClick={(e) => e.stopPropagation()} // prevent triggering the job link overlay
                            >
                                <CompanyLogo
                                    slug={job.companyName.toLowerCase().replace(/\s+/g, "-")}
                                    name={job.companyName}
                                    size={14}
                                />
                                <span>{job.companyName}</span>
                            </Link>
                        )}

                        {job.companyName && job.location && <span>—</span>}
                        {job.location && <span>{job.location}</span>}

                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {postedPretty}
                        </span>
                    </p>
                </div>

                {/* RIGHT: compact transparency stats */}
                {stats && (
                    <div className="relative z-10 shrink-0 self-start">
                        <div
                            className={`text-xs text-gray-600 dark:text-gray-300 transition ${isAuthed ? "" : "blur-[3px] select-none pointer-events-none"
                                }`}
                            aria-hidden={!isAuthed}
                        >
                            <div className="flex items-center gap-3">
                                <span title="Response rate">
                                    RR: {stats.initialRate !== null ? `${stats.initialRate}%` : "—"}
                                </span>
                                <span className="opacity-40">•</span>
                                <span title="Median reply time">
                                    Median:{" "}
                                    {stats.medianDays !== null ? `${stats.medianDays}d` : "—"}
                                </span>
                                <span className="opacity-40">•</span>
                                <span title="Interview rate">
                                    IR: {stats.interviewRate !== null ? `${stats.interviewRate}%` : "—"}
                                </span>
                                <span className="opacity-40">•</span>
                                <span title="Offer rate">
                                    OR: {stats.offerRate !== null ? `${stats.offerRate}%` : "—"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();     // don't follow the card's absolute link
                                e.stopPropagation();    // don't bubble to the card
                                openAuthModal("login"); // or "signup" if you prefer
                            }}
                            className="pointer-events-auto rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm underline decoration-white/60 underline-offset-2 hover:decoration-white"
                        >
                            Sign in to unlock
                        </button>
                    </div>
                )}
            </div>

            {/* Expandable full description */}
            {descriptionHtml && (
                <div className="mt-4">
                    {onToggleDescription && (
                        <button
                            type="button"
                            onClick={(e) => {
                                // Don't trigger the card's click (which opens the job URL)
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleDescription();
                            }}
                            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            {isExpanded ? "Hide details" : "View details"}
                        </button>
                    )}

                    {isExpanded && (
                        <div className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-800 dark:border-gray-800 dark:text-gray-100">
                            <div
                                className="prose prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-3 dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            />
                        </div>
                    )}
                </div>
            )}

            <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/5 dark:group-hover:ring-white/10" />
        </li>
    );
}
