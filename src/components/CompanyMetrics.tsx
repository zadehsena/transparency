"use client";

import CompanyJobPostingsChart from "@/components/CompanyJobPostingsChart";

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
}: {
    kpis: KPI | null;
    businessUnits: BUStat[];
    weekly?: { date: string; count: number }[];
    monthly?: { date: string; count: number }[];
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
                <MetricChartCard title="Job posting trend">
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title=""
                        />
                    )}
                </MetricChartCard>

                {/* CHART 2 */}
                <MetricChartCard title="Interview trend">
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title=""
                        />
                    )}
                </MetricChartCard>

                {/* CHART 3 */}
                <MetricChartCard title="Response rate trend">
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title=""
                        />
                    )}
                </MetricChartCard>

                {/* CHART 4 */}
                <MetricChartCard title="Offer trend">
                    {weekly && monthly && (
                        <CompanyJobPostingsChart
                            weekly={weekly}
                            monthly={monthly}
                            title=""
                        />
                    )}
                </MetricChartCard>
            </div>

            {/* ================================
                BUSINESS UNIT PERFORMANCE TABLE
            ================================= */}
            {businessUnits?.length > 0 && (
                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Business unit performance
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="py-2 pr-4 text-left">Unit</th>
                                    <th className="py-2 px-4 text-right">Apps</th>
                                    <th className="py-2 px-4 text-right">Response %</th>
                                    <th className="py-2 px-4 text-right">Interview %</th>
                                    <th className="py-2 px-4 text-right">Offer %</th>
                                    <th className="py-2 pl-4 text-right">Median days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {businessUnits.map((bu) => {
                                    const respRate =
                                        bu.applications > 0
                                            ? Math.round((bu.responses / bu.applications) * 100)
                                            : null;
                                    const interviewRate =
                                        bu.applications > 0
                                            ? Math.round((bu.interviews / bu.applications) * 100)
                                            : null;
                                    const offerRate =
                                        bu.applications > 0
                                            ? Math.round((bu.offers / bu.applications) * 100)
                                            : null;

                                    return (
                                        <tr
                                            key={bu.id ?? bu.name}
                                            className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                                        >
                                            <td className="py-2 pr-4 font-medium text-gray-800 dark:text-gray-100">
                                                {bu.name || "—"}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                {bu.applications.toLocaleString()}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                {respRate != null ? `${respRate}%` : "—"}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                {interviewRate != null ? `${interviewRate}%` : "—"}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                {offerRate != null ? `${offerRate}%` : "—"}
                                            </td>
                                            <td className="py-2 pl-4 text-right">
                                                {bu.medianResponseDays != null
                                                    ? `${bu.medianResponseDays}d`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
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
function MetricChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                {title}
            </h2>
            {children}
        </div>
    );
}
