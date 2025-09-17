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

export default async function JobsRegionIndex() {
  // Count open jobs per region
  const countsRaw = await prisma.job.groupBy({
    by: ["region"],
    where: { closed: false },
    _count: { _all: true },
  });

  // Treat null/unknown as "global" so the tile still shows a number
  const counts = Object.fromEntries(
    countsRaw.map((c) => [String(c.region ?? "global"), c._count._all])
  ) as Record<string, number>;

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
          return (
            <Link
              key={r}
              href={`/jobs/${encodeURIComponent(r)}`}
              className="group relative flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm ring-1 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ring-gray-100 dark:ring-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 ring-1 ring-inset ring-gray-100 dark:ring-gray-800">
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
