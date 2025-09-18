// src/components/JobCard.tsx
"use client";

import { openAuthModal } from "@/lib/authModal";
import { useSession } from "next-auth/react";

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
}: {
    job: JobCardJob;
    stats?: JobCardStats;
    isAuthed?: boolean;
}) {
    const postedPretty = new Date(job.postedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <li className="group relative rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            {/* whole card clickable */}
            {job.url && (
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-0"
                    aria-label={`Open job: ${job.title}`}
                />
            )}

            {/* Top row: title/company/meta, right = stats */}
            <div className="flex items-start justify-between gap-4 relative z-10">
                {/* LEFT */}
                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                        {job.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.companyName ? <span className="font-medium">{job.companyName}</span> : null}
                        {job.companyName && job.location ? " — " : null}
                        {job.location || ""}
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

            <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/5 dark:group-hover:ring-white/10" />
        </li>
    );
}
