'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import JobCard, { type JobCardJob, type JobCardStats } from "./JobCard";

export type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  url?: string | null;
  unit?: string;
};

// BU stats coming from company.businessUnits
type BUStat = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  medianResponseDays: number | null;
};

// Company-level KPIs from company.kpis
type OverallKPIs = {
  overallResponseRate: number;         // %
  totalApplications: number;
  medianResponseDays: number | null;
};

export default function CompanyJobs({
  slug,
  initialJobs,
  buStats,   // <-- add this
  overall,   // <-- and this
  pageSize = 25,
}: {
  slug: string;
  initialJobs: Job[];
  buStats: BUStat[];
  overall: OverallKPIs;
  pageSize?: number;
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // Fast lookup for BU by name
  const buMap = useMemo(() => {
    const m = new Map<string, BUStat>();
    (buStats || []).forEach(b => m.set((b.name || '').toLowerCase(), b));
    return m;
  }, [buStats]);

  // Helper: stats for a given job (BU-specific if possible, else company-level)
  function getJobStats(job: Job) {
    const bu =
      job.unit ? buMap.get(job.unit.toLowerCase()) : undefined;

    // Initial response rate
    const initialRate = (() => {
      if (bu && bu.applications > 0) {
        return Math.round((bu.responses / bu.applications) * 100);
      }
      // fallback to company overall rate
      return Math.round(overall.overallResponseRate);
    })();

    const interviewRate = bu && bu.applications > 0
      ? Math.round((bu.interviews / bu.applications) * 100)
      : null;

    const offerRate = bu && bu.applications > 0
      ? Math.round((bu.offers / bu.applications) * 100)
      : null;

    const medianDays =
      (bu?.medianResponseDays ?? overall.medianResponseDays) ?? null;

    return { initialRate, interviewRate, offerRate, medianDays };
  }

  // Reset when slug / initial changes
  useEffect(() => {
    setJobs(initialJobs || []);
    setPage(1);
    setHasNext(true);
    setError(null);
    inflight.current?.abort();
    inflight.current = null;
  }, [slug, initialJobs]);

  async function loadMore() {
    if (loading || !hasNext) return;
    setLoading(true);
    setError(null);

    const ac = new AbortController();
    inflight.current = ac;
    const timeout = setTimeout(() => ac.abort('timeout'), 15000);

    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/company/${encodeURIComponent(slug)}/jobs?page=${nextPage}&pageSize=${pageSize}`,
        { cache: 'no-store', signal: ac.signal }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${body}`);
      }
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || 'Unknown API error');

      setJobs(prev => [...prev, ...(data.jobs || [])]);
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

  if (!jobs?.length) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">
        No active listings right now.
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {jobs.map((job) => {
          // Map to shared JobCard shape
          const cardJob: JobCardJob = {
            id: job.id,
            title: job.title,
            location: job.location ?? "—",
            postedAt: job.postedAt,                 // already ISO
            url: job.url ?? undefined,              // make optional
            // We’re on a company page, so omit companyName
            companyName: null,
            // unit is optional in JobCard; include if you’d like:
            // unit: job.unit ?? null,
          };

          return <JobCard key={job.id} job={cardJob} stats={getJobStats(job)} isAuthed={isAuthed} />;
        })}
      </ul>


      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div>Showing {jobs.length}</div>
        <div className="flex items-center gap-2">
          {error && <span className="text-red-600">{error}</span>}
          {hasNext ? (
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          ) : (
            <span>End</span>
          )}
        </div>
      </div>
    </div>
  );
}
