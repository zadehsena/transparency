// src/lib/companies.ts
import { prisma } from "@/lib/prisma";
import type { JobCategory, Region } from "@prisma/client";
import { LABEL as CATEGORY_LABEL } from "@/lib/jobs/categoryMeta";

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
    category?: JobCategory | null;
    region?: Region | null;
    descriptionHtml?: string | null;
  }[];
  jobCategories: {
    name: string;  // e.g. "Software"
    value: number; // # of open jobs
  }[];
  jobRegions: {
    name: string;
    value: number;
  }[];
  kpis: {
    overallResponseRate: number;
    totalApplications: number;
    medianResponseDays: number | null;
  };

  updatedAt: string;
};

export async function getPopularCompanySlugs(limit = 50) {
  const rows = await prisma.company.findMany({
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => r.slug);
}

export type CompanyListItem = {
  slug: string;
  name: string;
};

export async function getRandomCompanies(
  limit = 8,
  excludeSlug?: string
): Promise<CompanyListItem[]> {
  const pool = await prisma.company.findMany({
    where: excludeSlug ? { slug: { not: excludeSlug } } : {},
    select: { slug: true, name: true },
    take: 200,
  });

  // Fisher–Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

export async function getCompanyBySlug(slug: string): Promise<CompanyView | null> {
  const s = (slug || "").toLowerCase();

  const company = await prisma.company.findUnique({
    where: { slug: s },
    include: {
      businessUnits: { orderBy: { name: "asc" } },
      jobs: {
        where: { closed: false },          // open jobs only
        orderBy: { postedAt: "desc" },
        include: { businessUnit: true },
      },
    },
  });

  if (!company) return null;

  const businessUnits = company.businessUnits.map((u) => ({
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
    totals.applications > 0
      ? Math.round((totals.responses / totals.applications) * 100)
      : 0;

  // Jobs mapped into view shape (includes category)
  const jobs = company.jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    postedAt: j.postedAt.toISOString(),
    url: j.url,
    unit: j.businessUnit?.name,
    category: j.category, // JobCategory | null
    region: j.region,
    descriptionHtml: j.descriptionHtml,
  }));

  const categoryCounts = new Map<JobCategory, number>();
  const regionCounts = new Map<string, number>();

  for (const j of company.jobs) {
    if (j.category) {
      categoryCounts.set(
        j.category,
        (categoryCounts.get(j.category) ?? 0) + 1
      );
    }
    if (j.region) {
      const key = j.region; // e.g. "asia", "north_america"
      regionCounts.set(key, (regionCounts.get(key) ?? 0) + 1);
    }
  }

  const jobCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      name: CATEGORY_LABEL?.[category] ?? category,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const titleCase = (s: string) =>
    s
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const jobRegions = Array.from(regionCounts.entries())
    .map(([region, count]) => ({
      name: titleCase(region), // "north_america" -> "North America"
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    medianResponseDays: company.medianResponseDays,

    employeesLow: company.employeesLow ?? null,
    employeesHigh: company.employeesHigh ?? null,
    medianBaseSalaryUSD: company.medianBaseSalaryUSD ?? null,
    medianTCSalaryUSD: company.medianTCSalaryUSD ?? null,
    foundedYear: company.foundedYear ?? null,
    hqCity: company.hqCity ?? null,

    businessUnits,
    jobs,
    jobCategories,
    jobRegions,
    kpis: {
      overallResponseRate,
      totalApplications: totals.applications,
      medianResponseDays: company.medianResponseDays,
    },
    updatedAt: company.updatedAt.toISOString(),
  };
}

