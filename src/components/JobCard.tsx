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
    companySlug?: string | null;  // 👈 add this
}

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
    onSelect,
    showInlineDescription = true,
}: {
    job: JobCardJob;
    stats?: JobCardStats;
    isAuthed?: boolean;
    descriptionHtml?: string | null;
    isExpanded?: boolean;
    onToggleDescription?: () => void;
    onSelect?: () => void;             // NEW
    showInlineDescription?: boolean;   // NEW
}) {
    const postedPretty = new Date(job.postedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });


    // Shorten multi-location strings
    let locationDisplay = job.location;
    if (job.location) {
        const parts = job.location.split(";").map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
            locationDisplay = `${parts[0]} and ${parts.length - 1} more`;
        }
    }

    const handleClick = () => {
        if (onSelect) {
            onSelect();
            return;
        }
        if (!job.url) return;
        window.open(job.url, "_blank", "noopener,noreferrer");
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLLIElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <li
            className="group relative cursor-pointer rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80"
            role={job.url || onSelect ? "button" : undefined}
            tabIndex={job.url || onSelect ? 0 : -1}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            {/* Top row: title/company/meta, right = stats */}
            <div className="relative flex items-start justify-between gap-4">
                {/* LEFT */}
                <div className="min-w-0">
                    <h2
                        className="mb-1.5 truncate text-lg font-bold text-gray-900 transition-colors
                       group-hover:text-blue-600 group-hover:underline underline-offset-2
                       dark:text-gray-100 dark:group-hover:text-blue-400"
                    >
                        {job.title}
                    </h2>

                    {/* ⬇️ CHANGE THIS FROM <p> TO <div> */}
                    <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {job.companyName && (
                            (() => {
                                const slug =
                                    job.companySlug ??
                                    job.companyName.toLowerCase().replace(/\s+/g, "-");

                                return (
                                    <Link
                                        href={`/company/${slug}`}
                                        className="pointer-events-auto flex items-center gap-2 font-medium text-gray-600 hover:text-blue-600 hover:underline dark:text-gray-400 dark:hover:text-blue-400"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <CompanyLogo
                                            slug={slug}
                                            name={job.companyName}
                                            size={14}
                                        />
                                        <span>{job.companyName}</span>
                                    </Link>
                                );
                            })()
                        )}

                        {job.companyName && locationDisplay && <span>—</span>}
                        {locationDisplay && <span>{locationDisplay}</span>}

                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {postedPretty}
                        </span>
                    </div>
                    {/* ⬆️ closing div */}
                </div>

                {/* RIGHT: compact transparency stats */}
                {stats && (
                    <div className="relative z-10 shrink-0 self-start">
                        <div
                            className={`text-xs text-gray-600 transition dark:text-gray-300 ${isAuthed ? "" : "pointer-events-none select-none blur-[3px]"
                                }`}
                            aria-hidden={!isAuthed}
                        >
                        </div>
                    </div>
                )}
            </div>

            {/* Expandable full description (optional, for non-split layouts) */}
            {descriptionHtml && showInlineDescription && (
                <div className="mt-4">
                    {onToggleDescription && (
                        <button
                            type="button"
                            onClick={(e) => {
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
