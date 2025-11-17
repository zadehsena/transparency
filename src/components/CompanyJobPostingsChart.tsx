"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

export type Point = {
    date: string;
    opened: number;
    closed: number;
};

export default function CompanyJobPostingsChart({
    weekly,
    monthly,
    title = "Job listings opened vs closed",
}: {
    weekly: Point[];
    monthly: Point[];
    title?: string;
}) {
    const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
    const data = mode === "weekly" ? weekly : monthly;

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Opened vs closed roles ({mode})
                    </p>
                </div>

                <div className="inline-flex rounded-lg border text-xs dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setMode("weekly")}
                        className={`px-3 py-1.5 ${mode === "weekly"
                            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                            : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            } rounded-l-lg`}
                    >
                        Weekly
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("monthly")}
                        className={`px-3 py-1.5 ${mode === "monthly"
                            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                            : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            } rounded-r-lg border-l dark:border-gray-700`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickMargin={6}
                            minTickGap={24}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            tickMargin={6}
                        />
                        <Tooltip
                            formatter={(value: any) => [value, "jobs"]}
                            labelFormatter={(label) => `Starting ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="opened"
                            name="Opened"
                            stroke="var(--chart-opened, #22c55e)"
                            dot={false}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="closed"
                            name="Closed"
                            stroke="var(--chart-closed, #ef4444)"
                            dot={false}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
