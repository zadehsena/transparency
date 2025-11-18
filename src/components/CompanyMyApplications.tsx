// src/components/CompanyMyApplications.tsx
"use client";

type CompanyMyApplicationsProps = {
    slug: string;
    name: string;
    stats?: {
        applied: number;
        rejected: number;
        interviews: number;
        offers: number;
    };
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
}: CompanyMyApplicationsProps) {
    const s = stats ?? {
        applied: 0,
        rejected: 0,
        interviews: 0,
        offers: 0,
    };

    const items = [
        {
            key: "applied" as const,
            label: LABELS.applied,
            value: s.applied,
        },
        {
            key: "rejected" as const,
            label: LABELS.rejected,
            value: s.rejected,
        },
        {
            key: "interviews" as const,
            label: LABELS.interviews,
            value: s.interviews,
        },
        {
            key: "offers" as const,
            label: LABELS.offers,
            value: s.offers,
        },
    ];

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

            {/* Placeholder / future state */}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                This view will later show your actual applications to {name} once
                tracking is connected. For now, these are placeholder counts.
            </p>
        </div>
    );
}
