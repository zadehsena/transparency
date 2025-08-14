'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string; // ISO
  url: string;
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
    } catch (e: any) {
      setError(e?.name === 'AbortError' ? 'Request timed out. Please try again.' : (e?.message || 'Failed to load more'));
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
          const { initialRate, interviewRate, offerRate, medianDays } = getJobStats(job);
          return (
            <li key={job.id} className="rounded-2xl border bg-white p-5 hover:shadow-sm transition-shadow">
              <a href={job.url} className="block" target="_blank" rel="noreferrer">
                {/* Top row: title + posted */}
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="font-semibold text-gray-900 text-base md:text-lg">{job.title}</div>
                  <div className="text-xs text-gray-500">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Sub row: unit • location */}
                <div className="mt-1 text-sm text-gray-600">
                  {job.unit ? <span className="font-medium text-gray-700">{job.unit}</span> : null}
                  {job.unit ? ' • ' : null}
                  <span>{job.location || '—'}</span>
                </div>

                {/* Stat chips */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1">
                    <span className="uppercase tracking-wide text-gray-500">Initial response</span>
                    <span className="font-medium text-gray-900">{initialRate}%</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1">
                    <span className="uppercase tracking-wide text-gray-500">Interview</span>
                    <span className="font-medium text-gray-900">{interviewRate ?? '—'}{interviewRate !== null ? '%' : ''}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1">
                    <span className="uppercase tracking-wide text-gray-500">Offer</span>
                    <span className="font-medium text-gray-900">{offerRate ?? '—'}{offerRate !== null ? '%' : ''}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1">
                    <span className="uppercase tracking-wide text-gray-500">Median resp.</span>
                    <span className="font-medium text-gray-900">{medianDays ?? '—'}{medianDays !== null ? ' days' : ''}</span>
                  </span>
                </div>
              </a>
            </li>
          );
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
