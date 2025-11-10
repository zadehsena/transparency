// src/app/company/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCompanyBySlug, getRandomCompanies } from "@/lib/companies";
import CompanyTabs from "@/components/CompanyTabs";
import CompanyStats from "@/components/CompanyStats";
import CompanyJobs from "@/components/CompanyJobs";
import CompanyLogo from "@/components/CompanyLogo";
import TransparencyScore from "@/components/TransparencyScore";
import CompanyNews from "@/components/CompanyNews";
import SimilarCompanies from "@/components/SimilarCompanies";
import CompanySummary from "@/components/CompanySummary";

type Params = { slug: string };
type Search = { tab?: string };

type Props = {
  params: Promise<Params>;
  searchParams: Promise<Search>;
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
  const rt = avgReplyDays == null ? 0.5 : Math.max(0, Math.min(1, 1 - avgReplyDays / 14));
  const sd = (salaryDisclosure ?? 0) / 100;
  const ja = (jobAccuracy ?? 0) / 100;
  return Math.round((rr * 0.4 + rt * 0.25 + sd * 0.2 + ja * 0.15) * 100);
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const activeTab = (tab ?? "overview") as "overview" | "myapps" | "jobs";

  // similar companies (random for now, excluding current)
  const similar = await getRandomCompanies(5, company.slug);

  const t = (company as any).transparency as
    | {
      score?: number | null;
      responseRate?: number | null;
      avgReplyDays?: number | null;
      salaryDisclosure?: number | null;
      jobAccuracy?: number | null;
      trend90d?: number | null;
    }
    | undefined;

  const score =
    t?.score ??
    roughScore({
      responseRate: t?.responseRate ?? company.kpis?.overallResponseRate,
      avgReplyDays: t?.avgReplyDays ?? company.kpis?.medianResponseDays,
      salaryDisclosure: t?.salaryDisclosure,
      jobAccuracy: t?.jobAccuracy,
    });

  const ticker = (company as any).ticker ?? "";
  const domain =
    (company as any).domain ??
    (company as any).websiteDomain ??
    (company as any).website ??
    "";

  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CompanyLogo slug={company.slug} name={company.name} size={28} />
            <h1 className="text-2xl font-semibold">{company.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Real response rates by business unit + live job listings
          </p>
        </div>

        {/* Right: Transparency Score */}
        <div className="w-full sm:w-auto">
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

      {/* Tab content (skip on overview to avoid duplicates) */}
      <div className="mt-4">
        {activeTab === "jobs" && (
          <CompanyJobs
            slug={company.slug}
            initialJobs={company.jobs.map(({ url, ...rest }) => ({
              ...rest,
              url: url ?? "",
            }))}
            buStats={company.businessUnits}
            overall={{
              overallResponseRate: company.kpis.overallResponseRate,
              totalApplications: company.kpis.totalApplications,
              medianResponseDays: company.kpis.medianResponseDays,
            }}
          />
        )}

        {activeTab === "myapps" && (
          <CompanyStats businessUnits={company.businessUnits} />
        )}
      </div>

      {/* Overview layout */}
      {activeTab === "overview" && (
        <>
          {/* Row 1: Company info (left) + Similar companies (right) */}
          <div className="mt-8 flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <CompanySummary
                name={company.name}
                hqCity={company.hqCity}
                employeesLow={company.employeesLow}
                employeesHigh={company.employeesHigh}
                foundedYear={company.foundedYear}
                domain={domain}
              />
            </div>

            <div className="w-full lg:w-1/4">
              <SimilarCompanies items={similar} />
            </div>
          </div>

          {/* Row 2: News full width */}
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
