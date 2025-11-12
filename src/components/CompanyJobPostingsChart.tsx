// src/components/CompanyJobPostingsChart.tsx
"use client";

import { useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import clsx from "clsx";

export type SeriesPoint = { date: string; count: number }; // date as YYYY-MM-DD label

export default function CompanyJobPostingsChart({
    weekly,
    monthly,
    className = "",
    title = "New job listings",
}: {
    weekly: SeriesPoint[];
    monthly: SeriesPoint[];
    className?: string;
    title?: string;
}) {
    const [mode, setMode] = useState<"week" | "month">("week");
    const data = mode === "week" ? weekly : monthly;

    return (
        <section
            className={clsx(
                "rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80",
                className
            )}
        >
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{title}</h3>
                <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setMode("week")}
                        className={clsx(
                            "px-3 py-1.5 text-sm",
                            mode === "week"
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        )}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setMode("month")}
                        className={clsx(
                            "px-3 py-1.5 text-sm",
                            mode === "month"
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        )}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
            ) : (
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ left: 6, right: 6, top: 4, bottom: 0 }}>
                            <CartesianGrid strokeOpacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                                minTickGap={24}
                            />
                            <YAxis
                                width={36}
                                tick={{ fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                labelClassName="text-sm"
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid var(--tw-color-gray-200)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#8B5CF6"        // soft violet accent
                                fill="#8B5CF6"
                                fillOpacity={0.18}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}
