// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyLogo from "@/components/CompanyLogo";

export const revalidate = 60; // cache for 1 minute

// ---- UI helpers ----
type Trend = "up" | "down" | "flat";

function TrendIcon({ t }: { t: Trend }) {
  const symbol = t === "up" ? "↑" : t === "down" ? "↓" : "↔";
  const color =
    t === "up" ? "text-emerald-600 dark:text-emerald-400"
      : t === "down" ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500 dark:text-gray-400";
  return <span aria-label={`trend-${t}`} className={`ml-1 ${color}`}>{symbol}</span>;
}

function StatLine({ value, label, trend = "flat" }: { value: string | number; label: string; trend?: Trend }) {
  return (
    <div className="flex items-center whitespace-nowrap text-xs">
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
      <span className="ml-1 text-gray-600 dark:text-gray-400">{label}</span>
      <TrendIcon t={trend} />
    </div>
  );
}

// ---- data: Most-searched (7d) ----
async function getTrending(limit = 10) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: since } },
    _count: { slug: true },
    orderBy: { _count: { slug: "desc" } },
    take: limit,
  });

  const slugs = rows.map((r) => r.slug);

  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    include: { businessUnits: true },
  });

  return slugs
    .map((slug) => {
      const company = companies.find((c) => c.slug === slug);
      if (!company) return null;

      const totalApps = company.businessUnits.reduce((sum, bu) => sum + (bu.applications ?? 0), 0);
      const totalResponses = company.businessUnits.reduce((sum, bu) => sum + (bu.responses ?? 0), 0);
      const overallResponseRate = totalApps > 0 ? Math.round((totalResponses / totalApps) * 100) : 0;

      const withMedians = company.businessUnits.filter((b) => b.medianResponseDays != null);
      const medianResponseDays =
        withMedians.length > 0
          ? Math.round(withMedians.reduce((sum, bu) => sum + (bu.medianResponseDays || 0), 0) / withMedians.length)
          : 0;

      return {
        slug: company.slug,
        name: company.name,
        overallResponseRate,
        totalApplications: totalApps,
        medianResponseDays,
        // NOTE: these are snapshot stats; without historicals they default to flat
        trendOverall: "flat" as Trend,
        trendApps: "flat" as Trend,
        trendMedianDays: "flat" as Trend,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
}

// ---- data: Top responders (window vs prior window) ----
async function getTopResponders(limit = 10, minApps = 10, windowDays = 90) {
  const msDay = 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - windowDays * msDay);
  const prevSince = new Date(since.getTime() - windowDays * msDay);

  // Current window apps
  const apps = await prisma.application.findMany({
    where: { createdAt: { gte: since } },
    select: {
      status: true,
      job: {
        select: {
          companyId: true,
          companyRel: { select: { slug: true, name: true } },
        },
      },
    },
  });

  // Prior window apps (prevSince..since)
  const prevApps = await prisma.application.findMany({
    where: { createdAt: { gte: prevSince, lt: since } },
    select: {
      status: true,
      job: {
        select: {
          companyId: true,
          companyRel: { select: { slug: true, name: true } },
        },
      },
    },
  });

  const curr = new Map<
    string,
    { slug: string; name: string; total: number; responded: number }
  >();
  const prev = new Map<
    string,
    { slug: string; name: string; total: number; responded: number }
  >();

  for (const a of apps) {
    const id = a.job?.companyId;
    const slug = a.job?.companyRel?.slug;
    const name = a.job?.companyRel?.name;
    if (!id || !slug || !name) continue;
    const e = curr.get(id) ?? { slug, name, total: 0, responded: 0 };
    e.total += 1;
    if (a.status !== "applied") e.responded += 1;
    curr.set(id, e);
  }

  for (const a of prevApps) {
    const id = a.job?.companyId;
    const slug = a.job?.companyRel?.slug;
    const name = a.job?.companyRel?.name;
    if (!id || !slug || !name) continue;
    const e = prev.get(id) ?? { slug, name, total: 0, responded: 0 };
    e.total += 1;
    if (a.status !== "applied") e.responded += 1;
    prev.set(id, e);
  }

  const epsilon = 0.5; // % points needed to count as up/down

  const list = Array.from(curr.entries())
    .filter(([, e]) => e.total >= minApps)
    .map(([id, e]) => {
      const responseRate = Math.round((e.responded / e.total) * 100);
      const p = prev.get(id);
      const prevRate = p && p.total > 0 ? Math.round((p.responded / p.total) * 100) : null;

      let trend: Trend = "flat";
      if (prevRate != null) {
        if (responseRate > prevRate + epsilon) trend = "up";
        else if (responseRate < prevRate - epsilon) trend = "down";
      }

      let appsTrend: Trend = "flat";
      if (p) {
        if (e.total > p.total) appsTrend = "up";
        else if (e.total < p.total) appsTrend = "down";
      }

      return {
        slug: e.slug,
        name: e.name,
        responseRate,
        totalApplications: e.total,
        trendResponse: trend,
        trendApps: appsTrend,
      };
    })
    .sort(
      (a, b) =>
        b.responseRate - a.responseRate ||
        b.totalApplications - a.totalApplications ||
        a.name.localeCompare(b.name)
    );

  return list.slice(0, limit);
}

export default async function HomePage() {
  const [trending, topResponders] = await Promise.all([getTrending(10), getTopResponders(10, 5, 90)]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* HERO */}
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Job applications shouldn’t vanish into the void.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Transparency shows real response rates by company and role. Track your apps, see who replies, and stop guessing.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-lg bg-gray-900 px-5 py-3 text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900"
            >
              Jobs
            </Link>
            <Link
              href="/login"
              className="rounded-lg border px-5 py-3 text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60"
            >
              Log In
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No credit card. Free to try.</p>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <Image
              src="/images/void.png"
              alt="Application drifting toward the void"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-16 space-y-6">
        {/* Most searched companies */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-1 text-lg font-bold text-white">
            Most searched companies (7 days)
          </div>
          <p className="mb-4 text-xs text-gray-400">
            Finding companies where apps don’t vanish helps you target smarter.
          </p>

          {trending.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No searches yet. Try the search bar above.</div>
          ) : (
            <ul className="divide-y dark:divide-gray-800/80">
              {trending.map((it) => (
                <li key={it.slug} className="py-3">
                  <Link href={`/company/${it.slug}`} className="block">
                    {/* mobile: stack; md+: inline */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      {/* left: logo + name */}
                      <div className="flex min-w-0 items-center gap-2">
                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {it.name}
                        </div>
                      </div>

                      {/* right: stats (wrap on small screens) */}
                      <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-1 text-xs md:basis-auto">
                        <StatLine value={`${it.overallResponseRate}%`} label="Overall Response" trend={it.trendOverall} />
                        <StatLine value={it.totalApplications} label="Total Applications" trend={it.trendApps} />
                        <StatLine value={it.medianResponseDays} label="Median Resp. Days" trend={it.trendMedianDays} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top response-rate companies */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-1 text-lg font-bold text-white">
            Top response-rate companies (90 days)
          </div>
          <p className="mb-4 text-xs text-gray-400">
            Applications often feel like they go into the void—this ranks companies by actual reply rate from recent submissions.
          </p>

          {topResponders.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Not enough data yet. Check back soon.</div>
          ) : (
            <ul className="divide-y dark:divide-gray-800/80">
              {topResponders.map((it) => (
                <li key={it.slug} className="py-3">
                  <Link href={`/company/${it.slug}`} className="block">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">{it.name}</div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <StatLine value={`${it.responseRate}%`} label="Response Rate" trend={it.trendResponse} />
                        <StatLine value={it.totalApplications} label="Applications (90d)" trend={it.trendApps} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
