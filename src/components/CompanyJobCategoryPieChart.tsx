"use client";

import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer,
    Legend,
} from "recharts";

export type JobCategorySlice = {
    name: string;
    value: number;
};

const COLORS = [
    "#0EA5E9",
    "#A855F7",
    "#F97316",
    "#22C55E",
    "#EC4899",
    "#6366F1",
    "#FACC15",
    "#14B8A6",
];

export default function CompanyJobCategoryPieChart({
    data,
    title = "Jobs by category",
}: {
    data: JobCategorySlice[];
    title?: string;
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No data yet for job categories.
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    if (total === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No open jobs with a category yet.
            </div>
        );
    }

    return (
        <div className="h-72">
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                {title}
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, _name, _payload) =>
                            `${value.toLocaleString()} jobs`
                        }
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
