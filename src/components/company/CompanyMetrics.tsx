"use client";

import CompanyJobPostingsChart, { type Point } from "@/components/company/CompanyJobPostingsChart";
import CompanyJobCategoryPieChart from "@/components/company/CompanyJobCategoryPieChart";
import ApplicationsSankey from "@/components/ApplicationsSankey";

type StatusKey = "clicked" | "applied" | "interview" | "offer" | "rejected";

type CompanySankeyApp = {
    status: StatusKey;
};

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
    businessUnits,
    weekly,
    monthly,
    jobCategories,
    jobRegions,
    applications
}: {
    kpis: KPI | null;
    businessUnits: BUStat[];
    weekly?: Point[];
    monthly?: Point[];
    jobCategories: { name: string; value: number }[];
    jobRegions: { name: string; value: number }[];
    applications?: CompanySankeyApp[];
}) {

    return (
        <div className="space-y-10">
            {/* company-wide applications Sankey */}
            {applications && applications.length > 0 && (
                <MetricChartCard>
                    <ApplicationsSankey
                        apps={applications}
                        title="Where did applicants end up?"
                    />
                </MetricChartCard>
            )}

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
                    {jobCategories?.length > 0 ? (
                        <CompanyJobCategoryPieChart
                            title="Jobs by category"
                            data={jobRegions}
                        />
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                            No data yet for job categories.
                        </div>
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
        </div>
    );
}

/* ===========================
   Reusable chart card component
   =========================== */
function MetricChartCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {children}
        </div>
    );
}
