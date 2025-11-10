// src/components/TransparencyScore.tsx
export type TransparencyProps = {
    score?: number | null;             // 0-100
    responseRate?: number | null;      // %
    avgReplyDays?: number | null;      // days
    salaryDisclosure?: number | null;  // %
    jobAccuracy?: number | null;       // %
    trend90d?: number | null;          // +/- points over last 90d
};

function fmt(v?: number | null, suffix = "") {
    if (v == null || Number.isNaN(v)) return "—";
    return `${v}${suffix}`;
}
function tierFor(score?: number | null) {
    if (score == null) return { label: "Unknown", color: "bg-gray-200 text-gray-700" } as const;
    if (score >= 80) return { label: "Highly Transparent", color: "bg-emerald-100 text-emerald-700" } as const;
    if (score >= 60) return { label: "Moderately Transparent", color: "bg-amber-100 text-amber-700" } as const;
    return { label: "Low Transparency", color: "bg-rose-100 text-rose-700" } as const;
}

export default function TransparencyScore({
    score = null,
    responseRate = null,
    avgReplyDays = null,
    salaryDisclosure = null,
    jobAccuracy = null,
    trend90d = null,
}: TransparencyProps) {
    const pct = Math.max(0, Math.min(100, Number(score ?? 0)));
    const ring = `conic-gradient(currentColor ${pct * 3.6}deg, #e5e7eb 0)`;
    const tier = tierFor(score);

    return (
        <div className="w-full rounded-2xl border bg-white p-4 sm:p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className="relative grid h-20 w-20 place-items-center text-indigo-600"
                        style={{ backgroundImage: ring, borderRadius: "9999px" }}
                        aria-label={score == null ? "No score" : `Transparency Score ${pct}`}
                        role="img"
                    >
                        <div className="absolute h-16 w-16 rounded-full bg-white" />
                        <div className="relative text-center">
                            <div className="text-2xl font-semibold">{score == null ? "—" : Math.round(pct)}</div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-500">/100</div>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-700">Transparency Score</div>
                        <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${tier.color}`}>
                            {tier.label}
                            {trend90d != null && (
                                <span className={trend90d >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                    {trend90d >= 0 ? "▲" : "▼"} {Math.abs(trend90d)} pt / 90d
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3 sm:w-auto sm:grid-cols-4">
                    <div>
                        <div className="text-xs text-gray-500">Response Rate</div>
                        <div className="text-sm font-medium">{fmt(responseRate, "%")}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Avg Reply Time</div>
                        <div className="text-sm font-medium">{fmt(avgReplyDays, " days")}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Salary Disclosure</div>
                        <div className="text-sm font-medium">{fmt(salaryDisclosure, "%")}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Job Accuracy</div>
                        <div className="text-sm font-medium">{fmt(jobAccuracy, "%")}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
