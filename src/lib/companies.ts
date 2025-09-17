import { prisma } from "@/lib/prisma";

export type CompanyView = {
  id: string;
  slug: string;
  name: string;
  medianResponseDays: number | null;

  // --- New facts ---
  employeesLow?: number | null;
  employeesHigh?: number | null;
  medianBaseSalaryUSD?: number | null;
  medianTCSalaryUSD?: number | null;
  foundedYear?: number | null;
  hqCity?: string | null;

  businessUnits: {
    name: string;
    applications: number;
    responses: number;
    interviews: number;
    offers: number;
    medianResponseDays: number | null;
  }[];
  jobs: {
    id: string;
    title: string;
    location: string;
    postedAt: string;
    url: string | null;
    unit?: string;
  }[];
  kpis: {
    overallResponseRate: number;
    totalApplications: number;
    medianResponseDays: number | null;
  };
  updatedAt: string;
};

export async function getCompanyBySlug(slug: string): Promise<CompanyView | null> {
  const s = (slug || "").toLowerCase();

  const company = await prisma.company.findUnique({
    where: { slug: s },
    include: {
      businessUnits: { orderBy: { name: "asc" } },
      jobs: {
        where: { closed: false },
        orderBy: { postedAt: "desc" },
        include: { businessUnit: true },
        take: 25,
      },
    },
  });
  if (!company) return null;

  const businessUnits = company.businessUnits.map(u => ({
    name: u.name,
    applications: u.applications,
    responses: u.responses,
    interviews: u.interviews,
    offers: u.offers,
    medianResponseDays: u.medianResponseDays,
  }));

  const totals = businessUnits.reduce(
    (acc, u) => {
      acc.applications += u.applications || 0;
      acc.responses += u.responses || 0;
      return acc;
    },
    { applications: 0, responses: 0 }
  );

  const overallResponseRate =
    totals.applications > 0 ? Math.round((totals.responses / totals.applications) * 100) : 0;

  const jobs = company.jobs.map(j => ({
    id: j.id,
    title: j.title,
    location: j.location,
    postedAt: j.postedAt.toISOString(),
    url: j.url,
    unit: j.businessUnit?.name,
  }));

  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    medianResponseDays: company.medianResponseDays,

    // --- Pass through facts (will be undefined/null if not set) ---
    employeesLow: company.employeesLow ?? null,
    employeesHigh: company.employeesHigh ?? null,
    medianBaseSalaryUSD: company.medianBaseSalaryUSD ?? null,
    medianTCSalaryUSD: company.medianTCSalaryUSD ?? null,
    foundedYear: company.foundedYear ?? null,
    hqCity: company.hqCity ?? null,

    businessUnits,
    jobs,
    kpis: {
      overallResponseRate,
      totalApplications: totals.applications,
      medianResponseDays: company.medianResponseDays,
    },
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
