// src/components/CompanyMyApplications.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApplicationsSankey from "@/components/ApplicationsSankey";

type StatusKey = "clicked" | "applied" | "interview" | "offer" | "rejected";

type CompanyMyApplicationsProps = {
    slug: string;
    name: string;
    stats?: {
        applied: number;
        rejected: number;
        interviews: number;
        offers: number;
    };
    applications?: {
        id: string;
        jobTitle: string;
        status: StatusKey;
        appliedAt: string; // ISO
        firstResponseAt?: string | null;
        url?: string | null;
    }[];
};

const LABELS = {
    applied: "Applications submitted",
    rejected: "Rejected",
    interviews: "Reached interview",
    offers: "Offers received",
};

const APPLICATION_STATUSES: StatusKey[] = [
    "clicked",
    "applied",
    "interview",
    "offer",
    "rejected",
];

function statusLabel(status: StatusKey) {
    switch (status) {
        case "clicked":
            return "Clicked apply";
        case "applied":
            return "Applied";
        case "interview":
            return "Interview";
        case "offer":
            return "Offer";
        case "rejected":
            return "Rejected";
        default:
            return status;
    }
}

export default function CompanyMyApplications({
    slug,
    name,
    stats,
    applications,
}: CompanyMyApplicationsProps) {
    const router = useRouter();

    const s = stats ?? {
        applied: 0,
        rejected: 0,
        interviews: 0,
        offers: 0,
    };

    const items = [
        { key: "applied" as const, label: LABELS.applied, value: s.applied },
        { key: "rejected" as const, label: LABELS.rejected, value: s.rejected },
        { key: "interviews" as const, label: LABELS.interviews, value: s.interviews },
        { key: "offers" as const, label: LABELS.offers, value: s.offers },
    ];

    // local state so we can optimistically update status
    const [apps, setApps] = useState(applications ?? []);

    useEffect(() => {
        setApps(applications ?? []);
    }, [applications]);

    const formatDate = (iso?: string | null) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleStatusChange = async (id: string, status: StatusKey) => {
        // optimistic update
        setApps((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status } : a))
        );

        try {
            await fetch(`/api/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch (e) {
            console.error("Failed to update status", e);
            // optional: rollback here if you want
        }
    };

    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    My application stats at {name}
                </h2>
                <button
                    type="button"
                    onClick={() => router.push("/profile?tab=applications")}
                    className="
    inline-flex items-center justify-center
    rounded-lg border border-gray-700 bg-gray-800/40
    px-4 py-2 text-xs font-medium text-gray-200
    hover:bg-gray-700/40 hover:border-gray-600
    transition
  "
                >
                    View all my applications
                </button>
            </div>

            {/* Stat blocks */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-sm dark:border-gray-800 dark:bg-gray-950"
                    >
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {item.label}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Company-level Sankey */}
            {apps.length > 0 && (
                <div className="mt-6">
                    <ApplicationsSankey
                        apps={apps}
                        title={`Where did my applications at ${name} go?`}
                    />
                </div>
            )}

            {/* Job list */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 text-sm dark:border-gray-800 dark:bg-gray-950">
                {apps.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                        You don&apos;t have any tracked applications for {name} yet. Apply
                        to one of their jobs from Transparency and confirm it to see it
                        here.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-900/70">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                        Applied
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                        First Response
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {apps.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="hover:bg-gray-100/70 dark:hover:bg-gray-900/60"
                                    >
                                        {/* Job title (now the link) */}
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            {a.url ? (
                                                <a
                                                    href={a.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline underline-offset-2 hover:no-underline"
                                                >
                                                    {a.jobTitle}
                                                </a>
                                            ) : (
                                                <span>{a.jobTitle}</span>
                                            )}
                                        </td>

                                        {/* Status (editable) */}
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            <select
                                                value={a.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        a.id,
                                                        e.target.value as StatusKey
                                                    )
                                                }
                                                className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-xs dark:border-gray-700"
                                            >
                                                {APPLICATION_STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {statusLabel(s)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Applied */}
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {formatDate(a.appliedAt)}
                                        </td>

                                        {/* First Response */}
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {formatDate(a.firstResponseAt ?? null)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
