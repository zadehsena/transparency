"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Props = { name: string; domain?: string; ticker?: string };
type NewsItem = {
    title: string; url: string; source?: string;
    publishedAt?: string; summary?: string; tags?: string[];
};

export default function CompanyNews({ name, domain = "", ticker = "" }: Props) {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const qs = new URLSearchParams({ name, domain, ticker });
                // API already limits to 3; client also slices to be safe
                const res = await fetch(`/api/company-news?${qs}`, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load");
                setItems((data.items || []).slice(0, 3));
            } catch (e: unknown) {
                const message =
                    e instanceof Error ? e.message : "Error";
                setErr(message);
            } finally {
                setLoading(false);
            }
        })();
    }, [name, domain, ticker]);

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="mb-1 text-lg font-bold text-white">Latest workforce news</div>
            <p className="mb-4 text-xs text-gray-400">
                Hiring, layoffs, and headcount updates related to {name}.
            </p>

            {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Loading news…</div>}
            {err && !loading && <div className="text-sm text-red-500">News error: {err}</div>}
            {!loading && !err && items.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">No recent job-related news.</div>
            )}

            {items.length > 0 && (
                <ul className="divide-y dark:divide-gray-800/80">
                    {items.map((a) => (
                        <li key={a.url} className="py-3">
                            <Link href={a.url} target="_blank" className="block">
                                <div className="flex flex-col gap-1">
                                    <div className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500 dark:text-gray-100">
                                        {a.title}
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {(a.source || "Source")} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
                                    </div>

                                    {a.tags?.length ? (
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {a.tags.slice(0, 4).map((t) => (
                                                <span
                                                    key={`${a.url}:${t}`}
                                                    className="rounded-full border bg-gray-50 px-2 py-0.5 text-[10px] text-gray-700 dark:border-gray-800 dark:bg-gray-800/70 dark:text-gray-300"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    {a.summary && (
                                        <p className="mt-1 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
                                            {a.summary}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
