"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function slugifyCompany(raw: string) {
  return raw.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

type Suggestion = { slug: string; name: string };

export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const acRef = useRef<AbortController | null>(null);

  const canSearch = useMemo(() => q.trim().length > 1, [q]);

  // Debounced fetch
  useEffect(() => {
    setHighlight(0);
    if (!canSearch) {
      setItems([]);
      setOpen(false);
      return;
    }
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/company/search?q=${encodeURIComponent(q)}&limit=8`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("bad response");
        const json = (await res.json()) as { items: Suggestion[] };
        setItems(json.items || []);
        setOpen((json.items || []).length > 0);
      } catch {
        if (!ac.signal.aborted) {
          setItems([]);
          setOpen(false);
        }
      }
    }, 150); // debounce

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q, canSearch]);

  const go = useCallback(
    (to?: Suggestion | null) => {
      if (!canSearch && !to) return;
      const slug = to?.slug || slugifyCompany(q);
      // analytics beacon
      try {
        const payload = JSON.stringify({ term: q, slug });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon?.("/api/analytics/search", blob) ||
          fetch("/api/analytics/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      } catch {}
      setOpen(false);
      router.push(`/company/${slug}`);
    },
    [q, canSearch, router]
  );

  return (
    <div className="relative flex w-full items-center gap-2" role="combobox" aria-expanded={open} aria-owns="company-ac-list">
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
          onFocus={() => items.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)} // allow click
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHighlight((h) => Math.min(h + 1, Math.max(items.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open && items[highlight]) go(items[highlight]);
              else go(null);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search company… (e.g., Google, Coinbase)"
          aria-label="Search company application stats"
          aria-autocomplete="list"
          aria-controls="company-ac-list"
          className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2 text-sm text-black outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />

        {/* Suggestions */}
        {open && items.length > 0 && (
          <ul
            id="company-ac-list"
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg"
          >
            {items.map((s, i) => (
              <li
                key={s.slug}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s)}
                className={`cursor-pointer rounded px-3 py-2 text-sm ${
                  i === highlight ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.slug}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        disabled={!canSearch}
        onClick={() => go(null)}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Search
      </button>
    </div>
  );
}
