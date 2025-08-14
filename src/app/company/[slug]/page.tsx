// app/company/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/companies";
import CompanyTabs from "@/components/CompanyTabs";
import CompanyStats from "@/components/CompanyStats";
import CompanyJobs from "@/components/CompanyJobs";
import CompanyLogo from '@/components/CompanyLogo';

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

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const activeTab = (tab ?? "stats") as "stats" | "jobs";

  return (
    <div className="mx-auto max-w-6xl p-4">
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
        <div className="flex gap-4 rounded-lg border bg-white p-3 text-sm">
          <div>
            <div className="text-gray-500">Overall Response Rate</div>
            <div className="font-medium">{company.kpis.overallResponseRate}%</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-gray-500">Total Applications</div>
            <div className="font-medium">
              {company.kpis.totalApplications.toLocaleString()}
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-gray-500">Median Response</div>
            <div className="font-medium">{company.kpis.medianResponseDays} days</div>
          </div>
        </div>
      </div>

      <CompanyTabs active={activeTab} />

      <div className="mt-4">
        {activeTab === "stats" ? (
          <CompanyStats businessUnits={company.businessUnits} />
        ) : (
          <CompanyJobs
            slug={company.slug}
            initialJobs={company.jobs}
            buStats={company.businessUnits}
            overall={{
              overallResponseRate: company.kpis.overallResponseRate,
              totalApplications: company.kpis.totalApplications,
              medianResponseDays: company.kpis.medianResponseDays,
            }}
          />
        )}
      </div>

      <p className="mt-8 text-xs text-gray-500">
        Last updated: {new Date(company.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
