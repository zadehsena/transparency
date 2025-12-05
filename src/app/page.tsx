// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyLogo from "@/components/company/CompanyLogo";
import LoginButton from "@/components/LoginButton";
import JobCard, { type JobCardJob } from "@/components/JobCard";

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

  // 1) Current window search counts
  const rows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: since } },
    _count: { slug: true },
    orderBy: { _count: { slug: "desc" } },
    take: limit,
  });

  // 2) Previous window search counts (for trend)
  const prevRows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: prevSince, lt: since } },
    _count: { slug: true },
  });

  const prevMap = new Map(
    prevRows.map((r) => [r.slug, r._count?.slug ?? 0]) // guard _count
  );

  const slugs = rows.map((r) => r.slug);

  // 3) 7-day applications per company (via Application -> Job -> Company)
  const recentApps = await prisma.application.findMany({
    where: {
      createdAt: { gte: since },
      job: {
        // 👇 adjust relation names if needed
        companyRel: {
          slug: { in: slugs },
        },
      },
    },
    select: {
      id: true,
      job: {
        select: {
          companyRel: {
            select: { slug: true },
          },
        },
      },
    },
  });

  const appsMap = new Map<string, number>();
  for (const a of recentApps) {
    const slug = a.job?.companyRel?.slug;
    if (!slug) continue;
    appsMap.set(slug, (appsMap.get(slug) ?? 0) + 1);
  }

  // 4) 7-day new jobs per company (via Job -> Company)
  const recentJobs = await prisma.job.findMany({
    where: {
      postedAt: { gte: since },
      closed: false, // keep if you only care about open roles
      companyRel: {
        slug: { in: slugs },
      },
    },
    select: {
      id: true,
      companyRel: {
        select: { slug: true },
      },
    },
  });

  const jobsMap = new Map<string, number>();
  for (const j of recentJobs) {
    const slug = j.companyRel?.slug;
    if (!slug) continue;
    jobsMap.set(slug, (jobsMap.get(slug) ?? 0) + 1);
  }

  // 5) Company + BU metrics (existing logic)
  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    include: { businessUnits: true },
  });

  return rows
    .map((r) => {
      const company = companies.find((c) => c.slug === r.slug);
      if (!company) return null;

      // trend thresholds
      const MIN_PREV = 1;
      const MIN_DELTA = 1;
      const MIN_PCT = 0.1;

      const curr = r._count?.slug ?? 0;
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
        trendSearches = "up";
      }

      const totalApps = company.businessUnits.reduce(
        (s, bu) => s + (bu.applications ?? 0),
        0
      );
      const totalResponses = company.businessUnits.reduce(
        (s, bu) => s + (bu.responses ?? 0),
        0
      );
      const overallResponseRate =
        totalApps > 0 ? Math.round((totalResponses / totalApps) * 100) : 0;

      const withMedians = company.businessUnits.filter(
        (b) => b.medianResponseDays != null
      );
      const medianResponseDays =
        withMedians.length > 0
          ? Math.round(
            withMedians.reduce(
              (s, bu) => s + (bu.medianResponseDays || 0),
              0
            ) / withMedians.length
          )
          : 0;

      // 👇 Use the JS-aggregated maps
      const applications7d = appsMap.get(company.slug) ?? 0;
      const newJobs7d = jobsMap.get(company.slug) ?? 0;

      return {
        slug: company.slug,
        name: company.name,
        searches7d: curr,
        overallResponseRate,
        totalApplications: totalApps,
        medianResponseDays,
        applications7d,
        newJobs7d,
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

async function getNewestJobs(limit = 5): Promise<JobCardJob[]> {
  const jobs = await prisma.job.findMany({
    where: {
      closed: false,
    },
    orderBy: { postedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      location: true,
      postedAt: true,
      url: true,
      company: true,
      businessUnit: {
        select: {
          name: true,
        },
      },
      companyRel: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    postedAt: j.postedAt.toISOString(),                 // JobCard expects string
    url: j.url ?? undefined,
    unit: j.businessUnit?.name ?? null,
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
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
      {/* HERO */}
      <div className="grid items-center gap-4 md:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        <div className="pl-4 md:pl-8">
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
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: logo + name + trend */}
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {/* Only show trend icon on md+ */}
                        <div className="hidden md:block">
                          <TrendIcon t={it.trendSearches} className="mx-2" />
                        </div>

                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-100">
                          {it.name}
                        </div>
                      </div>

                      {/* Right: pill stats */}
                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                        <span className="rounded-full bg-sky-500/10 px-2 py-1 font-medium text-sky-300">
                          {it.searches7d} searches
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-2 py-1 font-medium text-amber-300">
                          {it.applications7d} apps
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-300">
                          {it.newJobs7d} new jobs
                        </span>
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
                        {/* Only show trend icon on md+ */}
                        <div className="hidden md:block">
                          <TrendIcon t="flat" className="mx-2" />
                        </div>

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

      {/* NEWEST JOBS – full width, compact rows */}
      {newestJobs.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-white">Newest job openings</div>
              <p className="text-xs text-gray-400">
                The 5 most recently posted roles.
              </p>
            </div>

            <Link
              href="/jobs"
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {newestJobs.map((job) => {
              // pretty date (from ISO string)
              const postedPretty = new Date(job.postedAt).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", year: "numeric" }
              );

              // shorten multi-location strings like JobCard does
              let locationDisplay = job.location;
              if (job.location) {
                const parts = job.location
                  .split(";")
                  .map((p) => p.trim())
                  .filter(Boolean);
                if (parts.length > 1) {
                  locationDisplay = `${parts[0]} and ${parts.length - 1} more`;
                }
              }

              const slug =
                job.companySlug ??
                (job.companyName
                  ? job.companyName.toLowerCase().replace(/\s+/g, "-")
                  : "");

              return (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-800/70"
                >
                  <div className="min-w-0">
                    {/* Title */}
                    <Link
                      href={job.url ?? (slug ? `/company/${slug}` : "#")}
                      className="block truncate font-semibold text-gray-900 hover:text-blue-600 hover:underline dark:text-gray-100 dark:hover:text-blue-400"
                    >
                      {job.title}
                    </Link>

                    {/* Company + location */}
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {job.companyName && (
                        <>
                          <Link
                            href={slug ? `/company/${slug}` : "#"}
                            className="flex items-center gap-1 font-medium text-gray-600 hover:text-blue-600 hover:underline dark:text-gray-300 dark:hover:text-blue-400"
                          >
                            <CompanyLogo slug={slug} name={job.companyName} size={14} />
                            <span>{job.companyName}</span>
                          </Link>
                          {locationDisplay && <span>—</span>}
                        </>
                      )}
                      {locationDisplay && <span>{locationDisplay}</span>}
                    </div>
                  </div>

                  {/* Date on the right, smaller */}
                  <div className="shrink-0 text-xs text-gray-400">
                    {postedPretty}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section >
  );
}
