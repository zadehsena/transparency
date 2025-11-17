"use client";

import CompanyJobPostingsChart, { type Point } from "@/components/CompanyJobPostingsChart";
import CompanyJobCategoryPieChart from "@/components/CompanyJobCategoryPieChart";

type KPI = {
    overallResponseRate: number | null;
    interviewRate?: number | null;
    offerRate?: number | null;
    medianResponseDays: number | null;
    totalApplications?: number | null;
};

type BUStat = {
    id?: string;
    name: string;
    applications: number;
    responses: number;
    interviews: number;
    offers: number;
    medianResponseDays: number | null;
};

export default function CompanyMetrics({
    kpis,
    businessUnits,
    weekly,
    monthly,
    jobCategories,
}: {
    kpis: KPI | null;
    businessUnits: BUStat[];
    weekly?: Point[];
    monthly?: Point[];
    jobCategories: { name: string; value: number }[];
}) {
    const overall = kpis ?? {
        overallResponseRate: null,
        interviewRate: null,
        offerRate: null,
        medianResponseDays: null,
        totalApplications: null,
    };

    return (
        <div className="space-y-10">
            {/* ================================
                4-CHART GRID (2×2)
            ================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CHART 1 */}
                <MetricChartCard>
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title="Job posting trend"
                        />
                    )}
                </MetricChartCard>

                {/* CHART 2 */}
                <MetricChartCard>
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title="Interview trend"
                        />
                    )}
                </MetricChartCard>

                {/* CHART 3 */}
                <MetricChartCard>
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title="Response rate trend"
                        />
                    )}
                </MetricChartCard>

                {/* CHART 4 — now a pie chart by “category”/unit */}
                <MetricChartCard>
                    {jobCategories?.length > 0 ? (
                        <CompanyJobCategoryPieChart
                            title="Jobs by category"
                            data={jobCategories}
                        />
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                            No data yet for job categories.
                        </div>
                    )}
                </MetricChartCard>
            </div>

            {/* business unit table unchanged */}
            {businessUnits?.length > 0 && (
                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Business unit performance
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            {/* ...rest of your table code exactly as-is */}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ===========================
   Reusable chart card component
   =========================== */
function MetricChartCard({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}
