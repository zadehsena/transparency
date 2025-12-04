// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyLogo from "@/components/company/CompanyLogo";
import LoginButton from "@/components/LoginButton";

export const revalidate = 60; // cache for 1 minute

// ---- UI helpers ----
type Trend = "up" | "down" | "flat";

function TrendIcon({
  t,
  className = "",
  size = 14,
}: {
  t: Trend;
  className?: string;
  size?: number;
}) {
  const src =
    t === "up"
      ? "/images/trend/up.png"
      : t === "down"
        ? "/images/trend/down.png"
        : "/images/trend/flat.png";

  return (
    <Image
      src={src}
      alt={`trend-${t}`}
      width={size}
      height={size}
      className={`inline-block ${className}`}
    />
  );
}

// ---- data: Most-searched (window vs prior window) ----
async function getTrending(limit = 5, windowDays = 7) {
  const msDay = 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - windowDays * msDay);
  const prevSince = new Date(since.getTime() - windowDays * msDay);

  const rows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: since } },
    _count: { slug: true },
    orderBy: { _count: { slug: "desc" } },
    take: limit,
  });

  const prevRows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: prevSince, lt: since } },
    _count: { slug: true },
  });

  const prevMap = new Map(prevRows.map(r => [r.slug, r._count.slug]));

  const slugs = rows.map(r => r.slug);
  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    include: { businessUnits: true },
  });

  return rows
    .map((r) => {
      const company = companies.find(c => c.slug === r.slug);
      if (!company) return null;

      // 👉 thresholds + trend logic goes here
      const MIN_PREV = 1;        // was 3
      const MIN_DELTA = 1;       // was 3
      const MIN_PCT = 0.10;      // was 0.20

      const curr = r._count.slug;
      const prev = prevMap.get(r.slug) ?? 0;

      let trendSearches: Trend = "flat";
      if (prev >= MIN_PREV) {
        const delta = curr - prev;
        const pct = prev > 0 ? delta / prev : 0;

        if (delta >= MIN_DELTA && pct >= MIN_PCT) {
          trendSearches = "up";
        } else if (-delta >= MIN_DELTA && -pct >= MIN_PCT) {
          trendSearches = "down";
        }
      } else if (prev === 0 && curr >= 5) {
        // treat clear breakouts from zero as "up" (tune 5 → 3/7 as you like)
        trendSearches = "up";
      }

      const totalApps = company.businessUnits.reduce((s, bu) => s + (bu.applications ?? 0), 0);
      const totalResponses = company.businessUnits.reduce((s, bu) => s + (bu.responses ?? 0), 0);
      const overallResponseRate = totalApps > 0 ? Math.round((totalResponses / totalApps) * 100) : 0;

      const withMedians = company.businessUnits.filter(b => b.medianResponseDays != null);
      const medianResponseDays =
        withMedians.length > 0
          ? Math.round(withMedians.reduce((s, bu) => s + (bu.medianResponseDays || 0), 0) / withMedians.length)
          : 0;

      return {
        slug: company.slug,
        name: company.name,
        searches7d: curr,
        overallResponseRate,
        totalApplications: totalApps,
        medianResponseDays,
        trendSearches,
        trendOverall: "flat" as Trend,
        trendApps: "flat" as Trend,
        trendMedianDays: "flat" as Trend,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
}

// ---- data: Top transparency-score companies ----
async function getTopTransparencyCompanies(limit = 5) {
  const companies = await prisma.company.findMany({
    where: {
      transparencyScore: { not: null },
    },
    select: {
      slug: true,
      name: true,
      transparencyScore: true,
    },
    orderBy: {
      transparencyScore: "desc",
    },
    take: 50, // grab more than we need so we can randomize ties
  });

  type Row = {
    slug: string;
    name: string;
    transparencyScore: number;
  };

  const groups = new Map<number, Row[]>();
  for (const c of companies) {
    const score = c.transparencyScore!;
    const arr = groups.get(score) ?? [];
    arr.push({ slug: c.slug, name: c.name, transparencyScore: score });
    groups.set(score, arr);
  }

  function shuffleInPlace<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  const scores = Array.from(groups.keys()).sort((a, b) => b - a); // high → low
  const result: Row[] = [];

  outer: for (const score of scores) {
    const group = groups.get(score)!;
    shuffleInPlace(group); // randomize only inside the tie group

    for (const row of group) {
      result.push(row);
      if (result.length >= limit) break outer;
    }
  }

  return result;
}

type NewestJob = {
  id: string;
  title: string;
  location: string;
  postedAt: Date;
  url: string | null;
  companyName: string;
  companySlug: string | null;
};

async function getNewestJobs(limit = 5): Promise<NewestJob[]> {
  const jobs = await prisma.job.findMany({
    where: {
      closed: false,          // optional: only open jobs
    },
    orderBy: { postedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      location: true,
      postedAt: true,
      url: true,
      company: true,          // raw company string
      companyRel: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  // flatten into the shape the UI expects
  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    postedAt: j.postedAt,
    url: j.url,
    companyName: j.companyRel?.name ?? j.company,
    companySlug: j.companyRel?.slug ?? null,
  }));
}

export default async function HomePage() {
  const [trending, topTransparent, newestJobs] = await Promise.all([
    getTrending(5),
    getTopTransparencyCompanies(5),
    getNewestJobs(5),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-0">
      {/* HERO */}
      <div className="grid items-center gap-4 md:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl leading-snug sm:leading-tight">
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
            <LoginButton>
              Log In
            </LoginButton>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No credit card. Free to try.</p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <Image
            src="/images/image6.png"
            alt="Applicants holding resumes"
            width={1502}   // actual image size
            height={811}
            priority
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Most searched companies */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-1 text-lg font-bold text-white">
            Most searched companies (7 days)
          </div>
          <p className="mb-4 text-xs text-gray-400">
            Finding companies where apps don’t vanish helps you target smarter.
          </p>

          {trending.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No searches yet. Try the search bar above.
            </div>
          ) : (
            <ul className="divide-y dark:divide-gray-800/80">
              {trending.map((it) => (
                <li key={it.slug} className="py-3">
                  <Link href={`/company/${it.slug}`} className="block">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <TrendIcon t={it.trendSearches} className="mx-2" />
                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {it.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top transparency-score companies */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-1 text-lg font-bold text-white">
            Top transparency score companies
          </div>
          <p className="mb-4 text-xs text-gray-400">
            Ranked by overall transparency score. Ties are shuffled so you don&apos;t always see the same order.
          </p>

          {topTransparent.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No transparency scores yet. Check back soon.
            </div>
          ) : (
            <ul className="divide-y dark:divide-gray-800/80">
              {topTransparent.map((it) => (
                <li key={it.slug} className="py-3">
                  <Link href={`/company/${it.slug}`} className="block">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {it.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Transparency</span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                          {it.transparencyScore}/100
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* NEWEST JOBS – full width */}
      {newestJobs.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-1 text-lg font-bold text-white">
            Newest job openings
          </div>
          <p className="mb-4 text-xs text-gray-400">
            The 5 most recently posted roles.
          </p>

          <ul className="space-y-3">
            {newestJobs.map((job) => (
              <li
                key={job.id}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <Link
                    href={job.url ?? `/company/${job.companySlug ?? ""}`}
                    className="block truncate font-medium text-gray-900 dark:text-gray-100"
                  >
                    {job.title}
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {job.companyName} · {job.location}
                  </div>
                </div>

                <div className="shrink-0 text-xs text-gray-400">
                  {new Date(job.postedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section >
  );
}
