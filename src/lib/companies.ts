import { prisma } from "@/lib/prisma";

export async function getCompanyBySlug(slug: string) {
  const s = (slug || "").toLowerCase();

  const company = await prisma.company.findUnique({
    where: { slug: s },
    include: {
      businessUnits: { orderBy: { name: "asc" } },
      jobs: { orderBy: { postedAt: "desc" }, include: { businessUnit: true } },
    },
  });

  if (!company) return null;

  // Derive KPIs from business units
  const totals = company.businessUnits.reduce(
    (acc, bu) => {
      acc.apps += bu.applications;
      acc.responses += bu.responses;
      return acc;
    },
    { apps: 0, responses: 0 }
  );

  const overallResponseRate =
    totals.apps > 0 ? Math.round((totals.responses / totals.apps) * 100) : 0;

  return {
    slug: company.slug,
    name: company.name,
    kpis: {
      overallResponseRate,
      totalApplications: totals.apps,
      medianResponseDays: company.medianResponseDays ?? 0,
    },
    businessUnits: company.businessUnits.map((b) => ({
      name: b.name,
      applications: b.applications,
      responses: b.responses,
      interviews: b.interviews,
      offers: b.offers,
      medianResponseDays: b.medianResponseDays ?? 0,
    })),
    jobs: company.jobs.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      postedAt: j.postedAt.toISOString(),
      url: j.url,
      unit: j.businessUnit?.name,
    })),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function getPopularCompanySlugs(limit = 50) {
  const rows = await prisma.company.findMany({
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => r.slug);
}
