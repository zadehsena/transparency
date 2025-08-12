import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

  // Pull stats from DB
  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    include: {
      businessUnits: true,
    },
  });

  return slugs
    .map((slug) => {
      const company = companies.find((c) => c.slug === slug);
      if (!company) return null;

      const totalApps = company.businessUnits.reduce((sum, bu) => sum + bu.applications, 0);
      const totalResponses = company.businessUnits.reduce((sum, bu) => sum + bu.responses, 0);
      const overallResponseRate = totalApps > 0 ? Math.round((totalResponses / totalApps) * 100) : 0;

      // For now, medianResponseDays = average of all BU medianResponseDays
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

export default async function HomePage() {
  const trending = await getTrending();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Job applications shouldn’t vanish into the void.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Transparency shows real response rates by company and role. Track your apps,
            see who replies, and stop guessing.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="/signup" className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-900">
              Get started
            </a>
            <a href="/login" className="rounded-lg border px-5 py-3 hover:bg-gray-50">
              Log in
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-500">No credit card. Free to try.</p>
        </div>

        <div className="space-y-6">
          {/* Most searched companies */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-3 text-sm font-medium text-gray-600">Most searched companies (7 days)</div>
            {trending.length === 0 ? (
              <div className="text-sm text-gray-500">No searches yet. Try the search bar above.</div>
            ) : (
              <ul className="divide-y">
                {trending.map((it) => (
                  <li key={it.slug} className="py-3">
                    <Link href={`/company/${it.slug}`} className="block hover:underline">
                      <div className="font-medium">{it.name}</div>
                      <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div>
                          <div className="font-semibold">{it.overallResponseRate}%</div>
                          <div>Overall Response Rate</div>
                        </div>
                        <div>
                          <div className="font-semibold">{it.totalApplications}</div>
                          <div>Total Applications</div>
                        </div>
                        <div>
                          <div className="font-semibold">{it.medianResponseDays}</div>
                          <div>Median Response Days</div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
