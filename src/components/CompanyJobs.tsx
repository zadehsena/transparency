// src/components/CompanyJobs.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import JobCard, { type JobCardJob, type JobCardStats } from "./JobCard";

export type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  url?: string | null;
  unit?: string | null;
  category?: string | null;
  region?: string | null;
  descriptionHtml?: string | null;
};

export type CompanyJobsProps = {
  slug: string;
  initialJobs: Job[];
  buStats: BUStat[];
  overall?: OverallKPIs;
  companyName: string;
  pageSize?: number;
  initialFilters?: {
    category?: string;
    region?: string;
    unit?: string;
    q?: string;
  };
  showStats?: boolean;
  disableLoadMore?: boolean;
};

type BUStat = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  medianResponseDays: number | null;
};

type OverallKPIs = {
  overallResponseRate: number; // %
  totalApplications: number;
  medianResponseDays: number | null;
};

export default function CompanyJobs({
  slug,
  initialJobs,
  buStats,
  overall,
  companyName,
  pageSize = 25,
  initialFilters,
  showStats = true,
  disableLoadMore = false,
}: CompanyJobsProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // split-view selection
  const [selectedId, setSelectedId] = useState<string | null>(
    initialJobs[0]?.id ?? null
  );

  // filters
  const [category, setCategory] = useState(initialFilters?.category ?? "");
  const [region, setRegion] = useState(initialFilters?.region ?? "");
  const [unit, setUnit] = useState(initialFilters?.unit ?? "");
  const [q, setQ] = useState(initialFilters?.q ?? "");

  // BU lookup
  const buMap = useMemo(() => {
    const m = new Map<string, BUStat>();
    (buStats || []).forEach((b) => m.set((b.name || "").toLowerCase(), b));
    return m;
  }, [buStats]);

  function getJobStats(job: Job): JobCardStats {
    // For pages where we don't care about stats (like generic /jobs)
    if (!showStats) return null;

    const bu = job.unit ? buMap.get(job.unit.toLowerCase()) : undefined;

    let initialRate: number | null = null;
    let interviewRate: number | null = null;
    let offerRate: number | null = null;
    let medianDays: number | null = null;

    if (bu && bu.applications > 0) {
      initialRate = Math.round((bu.responses / bu.applications) * 100);
      interviewRate = Math.round((bu.interviews / bu.applications) * 100);
      offerRate = Math.round((bu.offers / bu.applications) * 100);
      medianDays = bu.medianResponseDays ?? null;
    } else if (overall) {
      // Fallback to overall KPIs if provided
      initialRate = Math.round(overall.overallResponseRate);
      medianDays = overall.medianResponseDays ?? null;
    }

    // If we truly have nothing, just hide the stats block
    if (
      initialRate === null &&
      interviewRate === null &&
      offerRate === null &&
      medianDays === null
    ) {
      return null;
    }

    return { initialRate, interviewRate, offerRate, medianDays };
  }

  // client-side filtering
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (category) {
      result = result.filter((j) => (j.category || "") === category);
    }
    if (region) {
      result = result.filter((j) => (j.region || "") === region);
    }
    if (unit) {
      const u = unit.toLowerCase();
      result = result.filter((j) => (j.unit || "").toLowerCase() === u);
    }
    if (q) {
      const qq = q.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(qq) ||
          (j.location || "").toLowerCase().includes(qq)
      );
    }

    return result;
  }, [jobs, category, region, unit, q]);

  // keep selection in sync with filtered list
  useEffect(() => {
    if (!filteredJobs.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredJobs.some((j) => j.id === selectedId)) {
      setSelectedId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedId]);

  const selectedJob = useMemo(
    () => filteredJobs.find((j) => j.id === selectedId) ?? null,
    [filteredJobs, selectedId]
  );

  // Reset when company / initial jobs change
  useEffect(() => {
    setJobs(initialJobs || []);
    setPage(1);
    setHasNext(true);
    setError(null);
    inflight.current?.abort();
    inflight.current = null;
    setSelectedId(initialJobs[0]?.id ?? null);
  }, [slug, initialJobs]);

  async function loadMore() {
    if (loading || !hasNext) return;
    setLoading(true);
    setError(null);

    const ac = new AbortController();
    inflight.current = ac;
    const timeout = setTimeout(() => ac.abort("timeout"), 15000);

    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/company/${encodeURIComponent(
          slug
        )}/jobs?page=${nextPage}&pageSize=${pageSize}`,
        { cache: "no-store", signal: ac.signal }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Fetch failed: ${res.status} ${res.statusText} ${body}`
        );
      }
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Unknown API error");

      setJobs((prev) => [...prev, ...(data.jobs || [])]);
      setPage(nextPage);
      setHasNext(Boolean(data.hasNext));
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else if (e instanceof Error) {
        setError(e.message || "Failed to load more");
      } else {
        setError("Failed to load more");
      }
    } finally {
      clearTimeout(timeout);
      if (inflight.current === ac) inflight.current = null;
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 lg:gap-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">All categories</option>
          <option value="software">Software</option>
          <option value="data_analytics">Data Analyst</option>
          <option value="product_management">Product Manager</option>
          <option value="design">Design</option>
          <option value="devops_sre">DevOps / SRE</option>
          <option value="security">Security</option>
          <option value="qa">QA / Test</option>
          <option value="it_support">IT Support</option>
          <option value="marketing">Marketing</option>
          <option value="sales">Sales</option>
          <option value="operations">Operations</option>
          <option value="finance">Finance</option>
          <option value="hr">HR / People</option>
          <option value="legal">Legal</option>
          <option value="other">Other</option>
        </select>

        {/* Region */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-xl border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">All regions</option>
          <option value="north_america">North America</option>
          <option value="europe">Europe</option>
          <option value="asia">Asia</option>
          <option value="south_america">South America</option>
          <option value="oceania">Oceania</option>
          <option value="africa">Africa</option>
          <option value="remote">Remote</option>
        </select>

        {/* Unit */}
        <input
          type="text"
          placeholder="Filter by team / unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="min-w-[160px] flex-1 rounded-xl border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Search title or location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
        />

        {/* Clear */}
        <button
          type="button"
          onClick={() => {
            setCategory("");
            setRegion("");
            setUnit("");
            setQ("");
          }}
          className="text-xs text-gray-500 underline"
        >
          Clear filters
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          No active listings match your filters.
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setRegion("");
              setUnit("");
              setQ("");
            }}
            className="ml-2 text-xs text-blue-600 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)] lg:items-start">
          {/* LEFT: list */}
          <div className="rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto">
            <ul className="space-y-3">
              {filteredJobs.map((job) => {
                const cardJob: JobCardJob = {
                  id: job.id,
                  title: job.title,
                  location: job.location ?? "—",
                  postedAt: job.postedAt,
                  url: job.url ?? undefined,
                  companyName,
                };

                return (
                  <JobCard
                    key={job.id}
                    job={cardJob}
                    stats={getJobStats(job)}
                    isAuthed={isAuthed}
                    descriptionHtml={job.descriptionHtml ?? null}
                    // split-view behavior:
                    onSelect={() => setSelectedId(job.id)}
                    showInlineDescription={false}
                  />
                );
              })}
            </ul>

            {/* pagination */}
            {!disableLoadMore && (
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div>Showing {filteredJobs.length}</div>
                <div className="flex items-center gap-2">
                  {error && <span className="text-red-600">{error}</span>}
                  {hasNext ? (
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
                    >
                      {loading ? "Loading…" : "Load more"}
                    </button>
                  ) : (
                    <span>End</span>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: full description (desktop only) */}
          <aside className="hidden rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto">
            {!selectedJob ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Select a job on the left to see the full description.
              </div>
            ) : (
              <>
                <header className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedJob.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {companyName}
                    {selectedJob.location ? ` • ${selectedJob.location}` : ""}
                  </p>
                </header>

                <div className="prose prose-sm max-w-none text-gray-800 dark:prose-invert dark:text-gray-100">
                  {selectedJob.descriptionHtml ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedJob.descriptionHtml,
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Full description not available for this listing.
                    </p>
                  )}
                </div>

                {selectedJob.url && (
                  <div className="mt-6">
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Apply on {companyName}
                    </a>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
