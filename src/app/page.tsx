// src/app/page.tsx (or wherever this HomePage lives)
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyLogo from "@/components/CompanyLogo";

export const revalidate = 60; // cache for 1 minute

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

      const totalApps = company.businessUnits.reduce((sum, bu) => sum + bu.applications, 0);
      const totalResponses = company.businessUnits.reduce((sum, bu) => sum + bu.responses, 0);
      const overallResponseRate = totalApps > 0 ? Math.round((totalResponses / totalApps) * 100) : 0;

      const medianResponseDays =
        company.businessUnits.length > 0
          ? Math.round(
            company.businessUnits.reduce((sum, bu) => sum + (bu.medianResponseDays || 0), 0) /
            company.businessUnits.length
          )
          : 0;

      return {
        slug: company.slug,
        name: company.name,
        overallResponseRate,
        totalApplications: totalApps,
        medianResponseDays,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
}

async function getTopResponders(limit = 10, minApps = 5, windowDays = 90) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

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

  const map = new Map<string, { slug: string; name: string; total: number; responded: number }>();

  for (const a of apps) {
    const companyId = a.job?.companyId;
    const slug = a.job?.companyRel?.slug;
    const name = a.job?.companyRel?.name;
    if (!companyId || !slug || !name) continue;

    const entry = map.get(companyId) ?? { slug, name, total: 0, responded: 0 };
    entry.total += 1;
    if (a.status !== "applied") entry.responded += 1;
    map.set(companyId, entry);
  }

  const list = Array.from(map.values())
    .filter((e) => e.total >= minApps)
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      responseRate: Math.round((e.responded / e.total) * 100),
      totalApplications: e.total,
    }))
    .sort(
      (a, b) =>
        b.responseRate - a.responseRate ||
        b.totalApplications - a.totalApplications ||
        a.name.localeCompare(b.name)
    );

  return list.slice(0, limit);
}

export default async function HomePage() {
  const [trending, topResponders] = await Promise.all([getTrending(5), getTopResponders(5, 5, 90)]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* HERO */}
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Job applications shouldn’t vanish into the void.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Transparency shows real response rates by company and role. Track your apps, see who replies, and stop
            guessing.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-gray-900 px-5 py-3 text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900"
            >
              Get started
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
          <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Most searched companies (7 days)</div>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-500">
            Finding companies where apps don’t vanish helps you target smarter.
          </p>

          {trending.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No searches yet. Try the search bar above.</div>
          ) : (
            <ul className="divide-y dark:divide-gray-800/80">
              {trending.map((it) => (
                <li key={it.slug} className="py-3">
                  <Link href={`/company/${it.slug}`} className="block">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CompanyLogo slug={it.slug} name={it.name} size={18} />
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">{it.name}</div>
                      </div>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                        {it.overallResponseRate}% RR
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{it.overallResponseRate}%</div>
                        <div>Overall Response</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{it.totalApplications}</div>
                        <div>Total Applications</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{it.medianResponseDays}</div>
                        <div>Median Resp. Days</div>
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
          <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Top response-rate companies (90 days)</div>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-500">
            Applications often feel like they go into the void—this ranks companies by actual reply rate from recent
            submissions.
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
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                        {it.responseRate}% RR
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{it.responseRate}%</div>
                        <div>Response Rate</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{it.totalApplications}</div>
                        <div>Applications (90d)</div>
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
