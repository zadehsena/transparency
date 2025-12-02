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
    "#3B82F6", // blue-500
    "#A855F7", // purple-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#6366F1", // indigo-500
    "#EC4899", // pink-500
    "#6EE7B7", // emerald-300
    "#F472B6", // rose-400
    "#FBBF24", // amber-400
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
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) =>
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
