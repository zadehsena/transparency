// src/app/jobs/page.tsx — REGION PICKER
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  REGION_ORDER,
  REGION_LABEL,
  REGION_BLURB,
  REGION_ICONS,
  type Region,
} from "@/lib/jobs/regionMeta";

export const dynamic = "force-dynamic";

// Per-region colors (mirrors CAT_STYLES vibe)
const REGION_STYLES: Record<Region | "global", { badgeBg: string; badgeText: string; ring: string }> = {
  north_america: { badgeBg: "bg-blue-50 dark:bg-blue-900/30", badgeText: "text-blue-700 dark:text-blue-300", ring: "ring-blue-100 dark:ring-blue-900/50" },
  europe: { badgeBg: "bg-indigo-50 dark:bg-indigo-900/30", badgeText: "text-indigo-700 dark:text-indigo-300", ring: "ring-indigo-100 dark:ring-indigo-900/50" },
  asia: { badgeBg: "bg-rose-50 dark:bg-rose-900/30", badgeText: "text-rose-700 dark:text-rose-300", ring: "ring-rose-100 dark:ring-rose-900/50" },
  oceania: { badgeBg: "bg-sky-50 dark:bg-sky-900/30", badgeText: "text-sky-700 dark:text-sky-300", ring: "ring-sky-100 dark:ring-sky-900/50" },
  latin_america: { badgeBg: "bg-emerald-50 dark:bg-emerald-900/30", badgeText: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-100 dark:ring-emerald-900/50" },
  middle_east: { badgeBg: "bg-amber-50 dark:bg-amber-900/30", badgeText: "text-amber-700 dark:text-amber-300", ring: "ring-amber-100 dark:ring-amber-900/50" },
  africa: { badgeBg: "bg-orange-50 dark:bg-orange-900/30", badgeText: "text-orange-700 dark:text-orange-300", ring: "ring-orange-100 dark:ring-orange-900/50" },
  remote: { badgeBg: "bg-violet-50 dark:bg-violet-900/30", badgeText: "text-violet-700 dark:text-violet-300", ring: "ring-violet-100 dark:ring-violet-900/50" },
  global: { badgeBg: "bg-slate-50 dark:bg-slate-800/50", badgeText: "text-slate-700 dark:text-slate-300", ring: "ring-slate-100 dark:ring-slate-800" },
};

export default async function JobsRegionIndex() {
  const countsRaw = await prisma.job.groupBy({
    by: ["region"],
    where: { closed: false },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of countsRaw) {
    const key = (row.region ?? "global") as string;
    counts[key] = row._count._all;
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Browse by Region
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Start by choosing a region. Next, pick a category filtered to that region.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REGION_ORDER.map((r: Region) => {
          const total = counts[r] ?? 0;
          const style = REGION_STYLES[r] ?? REGION_STYLES.global;

          return (
            <Link
              key={r}
              href={`/jobs/${encodeURIComponent(r)}`}
              className={`group relative flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm ring-1 transition
                          hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${style.ring}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${style.badgeBg} ${style.badgeText} ring-1 ring-inset ${style.ring}`}>
                <Image
                  src={REGION_ICONS[r]}
                  alt={`${REGION_LABEL[r]} icon`}
                  width={28}
                  height={28}
                  className="rounded-sm"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                    {REGION_LABEL[r]}
                  </h2>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700">
                    {total} {total === 1 ? "job" : "jobs"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                  {REGION_BLURB[r]}
                </p>
              </div>

              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/5 dark:group-hover:ring-white/10" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
