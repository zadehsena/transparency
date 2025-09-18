// app/company/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/companies";
import CompanyTabs from "@/components/CompanyTabs";
import CompanyStats from "@/components/CompanyStats";
import CompanyJobs from "@/components/CompanyJobs";
import CompanyLogo from "@/components/CompanyLogo";

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

// --- small local formatters (no extra imports) ---
function fmtInt(n?: number | null) {
  return typeof n === "number" ? n.toLocaleString() : "—";
}
function fmtRange(lo?: number | null, hi?: number | null) {
  if (lo && hi) return `${fmtInt(lo)}–${fmtInt(hi)}`;
  if (lo) return `~${fmtInt(lo)}`;
  if (hi) return `≤${fmtInt(hi)}`;
  return "—";
}

// Narrowing helper so we can read optional meta without `any`
function hasCompanyMeta(
  c: unknown
): c is { hqCity?: string | null; foundedYear?: number | null } {
  return typeof c === "object" && c !== null && ("hqCity" in c || "foundedYear" in c);
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const activeTab = (tab ?? "stats") as "stats" | "jobs";

  const hqCity = hasCompanyMeta(company) ? company.hqCity ?? "—" : "—";
  const foundedYear = hasCompanyMeta(company) ? company.foundedYear ?? "—" : "—";

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

        {/* Facts + KPIs strip */}
        <div className="flex flex-wrap items-stretch gap-4 rounded-lg border bg-white p-3 text-sm">
          {/* Employees */}
          <div>
            <div className="text-gray-500">Employees</div>
            <div className="font-medium">
              {fmtRange(
                company.employeesLow as number | undefined,
                company.employeesHigh as number | undefined
              )}
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />

          {/* Existing KPIs */}
          <div>
            <div className="text-gray-500">Overall Response Rate</div>
            <div className="font-medium">{company.kpis.overallResponseRate}%</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />

          <div>
            <div className="text-gray-500">Total Applications</div>
            <div className="font-medium">{company.kpis.totalApplications.toLocaleString()}</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />

          <div>
            <div className="text-gray-500">Median Response</div>
            <div className="font-medium">
              {company.kpis.medianResponseDays != null ? `${company.kpis.medianResponseDays} days` : "—"}
            </div>
          </div>

          {/* Optional meta on the far right if you populated them */}
          {(hqCity !== "—" || foundedYear !== "—") && (
            <>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <div className="text-gray-500">HQ</div>
                <div className="font-medium">{hqCity}</div>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <div className="text-gray-500">Founded</div>
                <div className="font-medium">{foundedYear}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <CompanyTabs active={activeTab} />

      {/* Content */}
      <div className="mt-4">
        {activeTab === "stats" ? (
          <CompanyStats businessUnits={company.businessUnits} />
        ) : (
          <CompanyJobs
            slug={company.slug}
            initialJobs={company.jobs.map(({ url, ...rest }) => ({
              ...rest,
              url: url ?? "", // coerce null → ""
            }))}
            buStats={company.businessUnits}
            overall={{
              overallResponseRate: company.kpis.overallResponseRate,
              totalApplications: company.kpis.totalApplications,
              medianResponseDays: company.kpis.medianResponseDays,
            }}
          />
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-500">
        Last updated: {new Date(company.updatedAt).toLocaleDateString()}
      </p>

      {/* Dev-only payload peek (uncomment if debugging) */}
      {process.env.NODE_ENV === "development" && false && (
        <pre className="mt-4 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-[11px] text-gray-600">
          {JSON.stringify(company, null, 2)}
        </pre>
      )}
    </div>
  );
}
