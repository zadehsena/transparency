// src/components/company/CompanyJobs.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { openAuthModal } from "@/lib/authModal";
import JobCard, {
  type JobCardJob,
  type JobCardStats,
} from "@/components/JobCard";
import CompanyLogo from "@/components/company/CompanyLogo";
import Image from "next/image";

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
  companyName?: string | null;
  companySlug?: string | null;
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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

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

  async function handleApplySelected() {
    if (!selectedJob || !selectedJob.url) return;

    // not logged in → show your existing login/signup modal
    if (!isAuthed) {
      openAuthModal("login");
      return;
    }

    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id }),
      });
    } catch (err) {
      console.error("Failed to track application click", err);
      // still let them apply
    } finally {
      window.open(selectedJob.url, "_blank", "noopener,noreferrer");
    }
  }

  const selectedCompanyName = selectedJob?.companyName ?? companyName;
  const selectedCompanySlug = selectedJob?.companySlug ?? slug;

  // shared renderer for the job list
  const renderJobsList = (extraClass = "") => (
    <div
      className={`rounded-2xl border bg-white p-3 shadow-sm 
        dark:border-gray-800 dark:bg-gray-950 ${extraClass}`}
    >
      <ul className="space-y-3">
        {filteredJobs.map((job) => {
          const cardJob: JobCardJob = {
            id: job.id,
            title: job.title,
            location: job.location ?? "—",
            postedAt: job.postedAt,
            url: job.url ?? undefined,
            companyName: job.companyName ?? companyName,
            companySlug: job.companySlug ?? undefined,
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
        <div className="mt-4 space-y-2 text-xs text-gray-500">
          {error && (
            <p className="px-1 text-[11px] text-red-500">
              {error}
            </p>
          )}

          {hasNext ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="
                w-full rounded-2xl border border-gray-800 
                bg-slate-950 px-4 py-3 text-sm font-medium text-gray-100
                text-center shadow-sm
                transition hover:border-gray-600 hover:bg-slate-900
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {loading ? "Loading…" : "Load more roles"}
            </button>
          ) : (
            <span className="block text-center text-[11px] text-gray-500">
              End of list
            </span>
          )}
        </div>
      )}
    </div>
  );

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
        <>
          {/* Mobile: list only */}
          <div className="lg:hidden">{renderJobsList()}</div>

          {/* Desktop: split view */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)] lg:items-start">
            {/* LEFT: list with scroll */}
            {renderJobsList(
              "min-w-0 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto"
            )}

            {/* RIGHT: full description */}
            <aside
              className="
                min-w-0 rounded-2xl border bg-white p-6 shadow-sm 
                dark:border-gray-800 dark:bg-gray-900 
                lg:max-h-[calc(100vh-180px)] 
                lg:overflow-y-auto
              "
            >
              {!selectedJob ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  Select a job on the left to see the full description.
                </div>
              ) : (
                <>
                  {/* Header: logo + title + company/location + apply button */}
                  <header className="mb-6 flex items-start justify-between gap-4">
                    {/* LEFT: logo + title */}
                    <div className="flex min-w-0 flex-1 gap-3">
                      {/* Logo should NEVER shrink */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center rounded-md bg-gray-900 p-2">
                          <CompanyLogo
                            slug={selectedCompanySlug}
                            name={selectedCompanyName}
                            size={40}
                          />
                        </div>
                      </div>

                      {/* Title + company */}
                      <div className="flex min-w-0 flex-col justify-center">
                        <h2 className="break-words text-xl font-semibold leading-snug text-gray-100">
                          {selectedJob.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                          {selectedCompanyName}
                          {selectedJob.location
                            ? ` • ${selectedJob.location}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: buttons */}
                    <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-2">
                      {selectedJob.url && (
                        <button
                          type="button"
                          onClick={handleApplySelected}
                          className="
                            btn-shine
                            inline-flex items-center justify-center rounded-full
                            bg-blue-600 px-4 py-2 text-sm font-medium text-white
                            hover:bg-blue-500
                            transition-all duration-300
                            whitespace-nowrap
                          "
                        >
                          Apply on {selectedCompanyName}
                        </button>
                      )}

                      <button
                        type="button"
                        className="
                          btn-shine inline-flex items-center justify-center gap-2 rounded-full
                          bg-amber-400 px-4 py-2 text-sm font-medium text-gray-900
                          hover:bg-amber-300
                          transition-all duration-300
                          whitespace-nowrap
                        "
                      >
                        <Image
                          src="/images/coins.png"
                          alt="coins"
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                        Request Referral
                      </button>
                    </div>
                  </header>

                  {/* Transparency Summary */}
                  <div
                    className="
                      relative mb-6 overflow-hidden rounded-2xl border border-gray-800 
                      bg-gradient-to-br from-slate-900/70 to-slate-800/40
                      p-5 shadow-lg shadow-black/30
                    "
                  >
                    {/* Accent left border */}
                    <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-blue-500/60" />

                    {/* Soft highlight */}
                    <div
                      className="pointer-events-none absolute inset-0 
                      bg-gradient-to-br from-white/5 to-transparent"
                    />

                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-100">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                      Transparency Summary
                    </h3>

                    <ul className="space-y-1.5 text-[13px] text-gray-300">
                      <li>
                        <span className="font-medium text-gray-100">
                          Response time:
                        </span>{" "}
                        3–7 days
                      </li>
                      <li>
                        <span className="font-medium text-gray-100">
                          Response rate:
                        </span>{" "}
                        ~42%
                      </li>
                      <li>
                        <span className="font-medium text-gray-100">
                          Interview likelihood:
                        </span>{" "}
                        ~12%
                      </li>
                      <li>
                        <span className="font-medium text-gray-100">
                          Offer likelihood:
                        </span>{" "}
                        ~2%
                      </li>
                      <li>
                        <span className="font-medium text-gray-100">
                          Job accuracy:
                        </span>{" "}
                        High
                      </li>
                    </ul>
                  </div>

                  {/* Description */}
                  <div
                    className="
                      prose prose-sm max-w-none leading-relaxed text-gray-800
                      dark:prose-invert dark:text-gray-100
                      [&_p>strong]:mb-2
                      [&_p>strong]:mt-6
                      [&_p>strong]:block
                      [&_p>strong]:text-lg
                      [&_p>strong]:font-semibold
                      [&_p>strong]:text-gray-100
                      [&_p]:my-3
                      [&_ul]:my-4
                      [&_li]:my-1.5
                    "
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(
                          selectedJob.descriptionHtml ?? ""
                        ),
                      }}
                    />
                  </div>
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
