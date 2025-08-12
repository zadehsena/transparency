"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

function slugifyCompany(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const canSearch = useMemo(() => q.trim().length > 1, [q]);

  const go = useCallback(() => {
    if (!canSearch) return;
    const slug = slugifyCompany(q);
    router.push(`/company/${slug}`);
  }, [q, canSearch, router]);

  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        {/* search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go();
          }}
          placeholder="Search company… (e.g., Google, Coinbase)"
          aria-label="Search company application stats"
          className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2 text-sm text-black outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <button
        type="button"
        disabled={!canSearch}
        onClick={go}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Search
      </button>
    </div>
  );
}
