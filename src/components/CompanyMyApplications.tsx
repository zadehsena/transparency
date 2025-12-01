// src/components/CompanyMyApplications.tsx
"use client";
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

export default function CompanyMyApplications({
    slug,
    name,
    stats,
    applications,
}: CompanyMyApplicationsProps) {
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

    const apps = applications ?? [];

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

    const statusLabel = (status: StatusKey) => {
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
    };

    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    My application stats at {name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Company: <span className="font-mono text-[11px]">{slug}</span>
                </p>
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
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {apps.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="hover:bg-gray-100/70 dark:hover:bg-gray-900/60"
                                    >
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            {a.jobTitle}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {statusLabel(a.status)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {formatDate(a.appliedAt)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {formatDate(a.firstResponseAt ?? null)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {a.url ? (
                                                <a
                                                    href={a.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-900 underline underline-offset-2 hover:no-underline dark:text-gray-100"
                                                >
                                                    View job
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
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
