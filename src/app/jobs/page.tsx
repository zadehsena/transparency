// src/app/jobs/page.tsx — ALL JOBS, PAGINATED
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyJobs from "@/components/company/CompanyJobs";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function JobsIndex({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const pageParam = sp.page;

  const parsed = pageParam ? Number(pageParam) : 1;
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const skip = (page - 1) * PAGE_SIZE;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { closed: false },
      orderBy: { postedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        location: true,
        postedAt: true,
        url: true,
        category: true,
        region: true,
        descriptionHtml: true,
        company: true,
        companyRel: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.job.count({
      where: { closed: false },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const initialJobs = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location ?? "",
    postedAt: j.postedAt.toISOString(),
    url: j.url ?? undefined,
    category: j.category ?? undefined,
    region: j.region ?? undefined,
    descriptionHtml: j.descriptionHtml ?? undefined,
    companyName: j.companyRel?.name ?? j.company ?? null,
    companySlug: j.companyRel?.slug ?? null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          All Open Jobs
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Use the filters below to narrow down by location, category, and more.
        </p>
      </header>

      <CompanyJobs
        slug="all"
        companyName="Various companies"  // 👈 just a fallback label; per-job names come from job.companyName
        initialJobs={initialJobs}
        buStats={[]}
        showStats={false}
        disableLoadMore={true}
        initialFilters={{}}
      />

      {/* Page-level pagination */}
      <nav className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>
          Showing {total === 0 ? 0 : skip + 1}–
          {skip + initialJobs.length} of {total} jobs
        </span>

        <div className="flex items-center gap-3">
          {hasPrev && (
            <Link
              href={`/jobs?page=${page - 1}`}
              className="rounded-full border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Previous
            </Link>
          )}
          {hasNext && (
            <Link
              href={`/jobs?page=${page + 1}`}
              className="rounded-full border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
