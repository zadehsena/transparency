"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CompanyLogo from "@/components/company/CompanyLogo";

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

  const canSearch = useMemo(() => q.trim().length > 0, [q]);

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

        let sent = false;
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          try {
            sent = navigator.sendBeacon("/api/analytics/search", blob);
          } catch { /* ignore */ }
        }
        if (!sent) {
          void fetch("/api/analytics/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true, // optional, but nice for page nav
          });
        }
      } catch { }
      setOpen(false);
      router.push(`/company/${slug}`);
    },
    [q, canSearch, router]
  );

  return (
    <div
      className="relative flex items-center gap-2 w-full"
      role="combobox"
      aria-expanded={open}
      aria-controls="company-ac-list"
      aria-haspopup="listbox"
    >
      <div className="relative flex-1">
        {/* search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700"
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
          onBlur={() => setTimeout(() => setOpen(false), 150)}
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
          className="w-full rounded-lg border border-gray-600 bg-white px-9 py-2 text-sm text-gray-800 placeholder:text-gray-500 outline-none ring-0 focus:border-gray-800 focus:ring-2 focus:ring-gray-200"
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
                className={`cursor-pointer rounded px-3 py-2 text-sm ${i === highlight ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CompanyLogo slug={s.slug} name={s.name} className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{s.name}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

  );
}
