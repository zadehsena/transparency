// src/app/company/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";

import { getCompanyBySlug, getRandomCompanies, type CompanyView } from "@/lib/companies";
import { aggregateWeeklyOpenClosed, aggregateMonthlyOpenClosed } from "@/lib/aggregateJobs";
import { CATEGORY_ORDER, LABEL as CATEGORY_LABEL, CATEGORY_ICONS } from "@/lib/jobs/categoryMeta";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import CompanyTabs, { type CompanyTabKey } from "@/components/company/CompanyTabs";
import CompanyMetrics from "@/components/company/CompanyMetrics";
import CompanyJobs from "@/components/company/CompanyJobs";
import CompanyLogo from "@/components/company/CompanyLogo";
import CompanyNews from "@/components/company/CompanyNews";
import CompanySummary from "@/components/company/CompanySummary";
import CompanyMyApplications from "@/components/company/CompanyMyApplications";
import SimilarCompanies from "@/components/company/SimilarCompanies";
import TransparencyScore, { type TransparencyProps } from "@/components/TransparencyScore";

import type { JobCategory } from "@prisma/client";


type Params = { slug: string };
type Search = {
  tab?: string
  jc?: string;   // job category
  jr?: string;   // job region
  unit?: string; // business unit
  q?: string;    // search text
};

type Props = {
  params: Promise<Params>;
  searchParams: Promise<Search>;
};
type CompanyWithExtras = CompanyView & {
  transparency?: TransparencyProps;
  ticker?: string | null;
  domain?: string | null;
  websiteDomain?: string | null;
  website?: string | null;
};

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return { title: "Company | Transparency" };
  return {
    title: `${company.name} | Transparency`,
    description: `Application stats and job listings for ${company.name}.`,
  };
}

// Simple scoring heuristic (until backend adds real score)
function roughScore({
  responseRate,
  avgReplyDays,
  salaryDisclosure,
  jobAccuracy,
}: {
  responseRate?: number | null;
  avgReplyDays?: number | null;
  salaryDisclosure?: number | null;
  jobAccuracy?: number | null;
}) {
  const rr = (responseRate ?? 0) / 100;
  const rt =
    avgReplyDays == null ? 0.5 : Math.max(0, Math.min(1, 1 - avgReplyDays / 14));
  const sd = (salaryDisclosure ?? 0) / 100;
  const ja = (jobAccuracy ?? 0) / 100;
  return Math.round((rr * 0.4 + rt * 0.25 + sd * 0.2 + ja * 0.15) * 100);
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab, jc, jr, unit, q } = await searchParams;

  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const PAGE_SIZE = 25;

  // All jobs returned in the CompanyView
  const allJobs = company.jobs ?? [];

  // Only send the first page down to the client for initial render
  const initialJobs = allJobs.slice(0, PAGE_SIZE).map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    postedAt: j.postedAt,                      // already a string in CompanyView
    url: j.url ?? "",
    unit: j.unit ?? null,
    category: j.category ?? null,              // JobCategory | null -> string | null
    region: j.region ?? null,                  // Region | null -> string | null
    descriptionHtml: j.descriptionHtml ?? null // full HTML from Greenhouse
  }));

  const openCategories =
    (company.jobCategories ?? []).filter((c) => c.value > 0);

  const CATEGORY_BY_LABEL: Record<string, JobCategory> = Object.fromEntries(
    CATEGORY_ORDER.map((key) => [CATEGORY_LABEL[key], key])
  ) as Record<string, JobCategory>;

  // ✅ Parse active tab safely, including "metrics"
  const rawTab = tab ?? "overview";
  const activeTab: CompanyTabKey =
    rawTab === "jobs" || rawTab === "myapps" || rawTab === "metrics"
      ? (rawTab as CompanyTabKey)
      : "overview";

  // similar companies (random for now, excluding current)
  const similar = await getRandomCompanies(5, company.slug);

  const extended = company as CompanyWithExtras;
  const t: TransparencyProps | undefined = extended.transparency;

  const score =
    t?.score ??
    roughScore({
      responseRate: t?.responseRate ?? company.kpis?.overallResponseRate,
      avgReplyDays: t?.avgReplyDays ?? company.kpis?.medianResponseDays,
      salaryDisclosure: t?.salaryDisclosure,
      jobAccuracy: t?.jobAccuracy,
    });

  const ticker = extended.ticker ?? "";
  const domain =
    extended.domain ?? extended.websiteDomain ?? extended.website ?? "";

  const weekly = aggregateWeeklyOpenClosed(company.jobs ?? [], 26); // opened vs closed
  const monthly = aggregateMonthlyOpenClosed(company.jobs ?? [], 12);

  // ---- My applications at this company (for logged-in user) ----
  const session = await getServerSession(authOptions);

  let myCompanyStats:
    | {
      applied: number;
      rejected: number;
      interviews: number;
      offers: number;
    }
    | undefined;

  let myCompanyApplications:
    | {
      id: string;
      jobTitle: string;
      status: "clicked" | "applied" | "interview" | "offer" | "rejected";
      appliedAt: string;
      firstResponseAt?: string | null;
      url?: string | null;
    }[]
    | undefined;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const apps = await prisma.application.findMany({
        where: {
          userId: user.id,
          job: {
            companyId: company.id, // 👈 only this company
          },
        },
        include: {
          job: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const appliedCount = apps.filter((a) => a.status === "applied").length;
      const rejectedCount = apps.filter((a) => a.status === "rejected").length;
      const interviewCount = apps.filter((a) => a.status === "interview").length;
      const offerCount = apps.filter((a) => a.status === "offer").length;

      myCompanyStats = {
        applied: appliedCount,
        rejected: rejectedCount,
        interviews: interviewCount,
        offers: offerCount,
      };

      myCompanyApplications = apps.map((a) => ({
        id: a.id,
        jobTitle: a.job.title,
        status: a.status as
          | "clicked"
          | "applied"
          | "interview"
          | "offer"
          | "rejected",
        appliedAt: (a.submittedAt ?? a.createdAt).toISOString(),
        firstResponseAt: a.firstResponseAt
          ? a.firstResponseAt.toISOString()
          : null,
        url: a.job.url ?? null,
      }));
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <CompanyLogo slug={company.slug} name={company.name} size={44} />
            <h1 className="text-3xl sm:text-3xl font-bold tracking-tight">
              {company.name}
            </h1>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Real response rates by business unit + live job listings
          </p>
        </div>

        {/* Right: Transparency Score */}
        <div className="w-full sm:w-auto sm:mt-4 lg:mt-6">
          <TransparencyScore
            score={score}
            responseRate={t?.responseRate ?? company.kpis?.overallResponseRate}
            avgReplyDays={t?.avgReplyDays ?? company.kpis?.medianResponseDays}
            salaryDisclosure={t?.salaryDisclosure}
            jobAccuracy={t?.jobAccuracy}
            trend90d={t?.trend90d}
          />
        </div>
      </div>

      {/* Tabs */}
      <CompanyTabs active={activeTab} />

      {/* Tab content area */}
      <div className="mt-4">
        {activeTab === "jobs" && (
          <CompanyJobs
            slug={company.slug}
            initialJobs={initialJobs}
            pageSize={PAGE_SIZE}
            buStats={company.businessUnits}
            overall={{
              overallResponseRate: company.kpis.overallResponseRate,
              totalApplications: company.kpis.totalApplications,
              medianResponseDays: company.kpis.medianResponseDays,
            }}
            companyName={company.name}
            initialFilters={{
              category: jc ?? "",
              region: jr ?? "",
              unit: unit ?? "",
              q: q ?? "",
            }}
            // Hide "Load more" if there aren't more than one page of jobs
            disableLoadMore={allJobs.length <= PAGE_SIZE}
          />
        )}

        {activeTab === "metrics" && (
          <CompanyMetrics
            kpis={company.kpis}
            businessUnits={company.businessUnits}
            weekly={weekly}
            monthly={monthly}
            jobCategories={company.jobCategories}
            jobRegions={company.jobRegions}
          />
        )}

        {activeTab === "myapps" &&
          (session?.user?.email ? (
            <CompanyMyApplications
              slug={company.slug}
              name={company.name}
              stats={myCompanyStats}
              applications={myCompanyApplications}
            />
          ) : (
            <div className="mt-4 rounded-2xl border bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Sign in to see your applications at {company.name}.
            </div>
          ))}
      </div>

      {/* Overview layout */}
      {activeTab === "overview" && (
        <>
          <div className="mt-8 grid gap-8 lg:grid-cols-4">
            {/* Left: Company overview + Job postings chart */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              <CompanySummary
                name={company.name}
                hqCity={company.hqCity}
                hqCountry={company.hqCountry}
                employeesLow={company.employeesLow}
                employeesHigh={company.employeesHigh}
                foundedYear={company.foundedYear}
                domain={domain}
                industry={company.industry}
                linkedinUrl={company.linkedinUrl}
                twitterUrl={company.twitterUrl}
              />

              {/* 🔹 Open roles by category */}
              {openCategories.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Open roles by category
                  </h2>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {openCategories.map((cat) => {
                      const key = CATEGORY_BY_LABEL[cat.name] ?? "other";
                      const label = CATEGORY_LABEL[key];
                      const iconSrc = CATEGORY_ICONS[key];

                      return (
                        <Link
                          key={cat.name}
                          href={{
                            pathname: `/company/${company.slug}`,
                            query: {
                              tab: "jobs",
                              jc: key, // JobCategory enum key, used by CompanyJobs initialFilters
                            },
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-slate-950/40 px-4 py-3 cursor-pointer transition hover:border-gray-600 hover:bg-slate-900"
                        >
                          {/* Icon bubble */}
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900/70">
                            <Image
                              src={iconSrc}
                              alt={label}
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain"
                            />
                          </div>

                          {/* Text */}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-100">
                              {label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {cat.value} open role{cat.value === 1 ? "" : "s"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Similar companies */}
            <div className="lg:col-span-1">
              <SimilarCompanies items={similar} />
            </div>
          </div>

          {/* Row 3: News full width */}
          <div className="mt-8">
            <CompanyNews name={company.name} domain={domain} ticker={ticker} />
          </div>
        </>
      )}

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-500">
        Last updated: {new Date(company.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
