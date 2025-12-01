"use client";

import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

type StatusKey = "clicked" | "applied" | "interview" | "offer" | "rejected";

type SankeyApp = {
    status: StatusKey;
};

const STATUS_LABEL: Record<StatusKey, string> = {
    clicked: "Clicked apply",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
};

const STATUS_ORDER: StatusKey[] = [
    "clicked",
    "applied",
    "interview",
    "offer",
    "rejected",
];

function SankeyLegend() {
    const items = [
        { label: "Clicked", color: "#7dd3fc" },
        { label: "Applied", color: "#86efac" },
        { label: "Interview", color: "#fde047" },
        { label: "Offer", color: "#a78bfa" },
        { label: "Rejected", color: "#fca5a5" },
    ];

    return (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
            {items.map((i) => (
                <div key={i.label} className="flex items-center gap-2">
                    <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: i.color }}
                    />
                    {i.label}
                </div>
            ))}
        </div>
    );
}

export default function ApplicationsSankey({
    apps,
    title = "Where did my applications go?",
}: {
    apps: SankeyApp[];
    title?: string;
}) {
    if (!apps || apps.length === 0) return null;

    // Count per status
    const counts: Record<StatusKey, number> = {
        clicked: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
    };

    for (const a of apps) {
        if (!a?.status) continue;
        counts[a.status] += 1;
    }

    const total = apps.length;

    // Only keep statuses that actually have data
    const activeStatuses = STATUS_ORDER.filter((s) => counts[s] > 0);

    if (activeStatuses.length === 0) return null;

    // Nodes:
    // 0: All applications
    // 1..N: each active status node
    const nodes = [
        { name: `All applications (${total})` },
        ...activeStatuses.map((k) => ({
            name: `${STATUS_LABEL[k]} (${counts[k]})`,
        })),
    ];

    // Links: All applications -> each active status
    const links = activeStatuses.map((status, idx) => ({
        source: 0,
        target: idx + 1,
        value: counts[status],
    }));

    const data = { nodes, links };

    // Dynamic height so we don't get a huge empty box
    const chartHeight = Math.max(160, activeStatuses.length * 50); // px

    return (
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                {title}
            </h3>

            {/* Chart */}
            <div className="w-full" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={data}
                        nodePadding={24}               // smaller padding
                        nodeWidth={12}
                        margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        link={{ strokeOpacity: 0.4 }}
                    >
                        <Tooltip />
                    </Sankey>
                </ResponsiveContainer>
            </div>

            <SankeyLegend />
        </div>
    );
}
