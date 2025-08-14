'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  url: string;
  unit?: string;
};

export default function CompanyJobs({
  slug,
  initialJobs,
  pageSize = 25,
}: {
  slug: string;
  initialJobs: Job[];
  pageSize?: number;
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true); // assume more until API says otherwise
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  // Reset when slug changes
  useEffect(() => {
    setJobs(initialJobs || []);
    setPage(1);
    setHasNext(true);
    setError(null);
    // cancel any in-flight
    inflight.current?.abort();
    inflight.current = null;
  }, [slug, initialJobs]);

  const shown = useMemo(() => jobs.length, [jobs]);

  async function loadMore() {
    if (loading || !hasNext) return;
    setLoading(true);
    setError(null);

    // Timeout guard so the button never stays stuck
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
      if (e?.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(e?.message || 'Failed to load more');
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
        {jobs.map(job => (
          <li key={job.id} className="rounded-lg border bg-white p-4 hover:shadow-sm">
            <a href={job.url} className="block hover:underline" target="_blank" rel="noreferrer">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-medium">{job.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(job.postedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {job.unit ? `${job.unit} • ` : ''}{job.location || '—'}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div>Showing {shown}</div>
        <div className="flex items-center gap-2">
          {error && <span className="text-red-600">{error}</span>}
          {hasNext ? (
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-60"
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
