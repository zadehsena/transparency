import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CATEGORY_ORDER, LABEL } from "@/lib/jobs/categoryMeta";
import type { JobCategory } from "@prisma/client";

type PageProps = {
    params: Promise<{ cat: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20; // tweak as you like

export default async function JobsByCategory({ params, searchParams }: PageProps) {
    const { cat } = await params;
    const sp = await searchParams;

    const normalized = (cat || "").toLowerCase().replace(/-/g, "_");
    const isValid = (CATEGORY_ORDER as string[]).includes(normalized);
    if (!isValid) redirect("/jobs");
    const selected = normalized as JobCategory;

    // page parsing (1-based)
    const pageRaw = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
    const pageNum = Math.max(1, Number(pageRaw ?? 1) || 1);
    const offset = (pageNum - 1) * PAGE_SIZE;

    // total count (for pagination UI)
    const total = await prisma.job.count({
        where: { closed: false, category: selected },
    });

    // paged jobs
    const jobs = await prisma.job.findMany({
        where: { closed: false, category: selected },
        orderBy: { postedAt: "desc" },
        skip: offset,
        take: PAGE_SIZE,
    });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Which jobs has this user already applied to?
    const session = await getServerSession(authOptions);
    const appliedIds = new Set<string>();
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (user) {
            const apps = await prisma.application.findMany({
                where: { userId: user.id },
                select: { jobId: true },
            });
            apps.forEach(a => appliedIds.add(a.jobId));
        }
    }

    async function applyAction(formData: FormData) {
        "use server";
        const jobId = String(formData.get("jobId") || "");
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) redirect("/login");
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true },
        });
        if (!user) redirect("/login");
        const existing = await prisma.application.findFirst({
            where: { userId: user.id, jobId },
        });
        if (!existing) {
            await prisma.application.create({
                data: { userId: user.id, jobId, status: "applied" },
            });
        }
        redirect("/applications");
    }

    return (
        <section className="mx-auto max-w-4xl p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold capitalize">
                    <Image
                        src="/images/void.png"
                        alt=""
                        width={24}
                        height={24}
                        className="rounded-sm"
                    />
                    {LABEL[selected]} Jobs
                </h1>
                <Link href="/jobs" className="text-sm text-gray-600 hover:underline">
                    ← All categories
                </Link>
            </div>

            {/* Results meta */}
            <p className="mb-4 text-sm text-gray-600">
                Showing <span className="font-medium">{jobs.length}</span> of{" "}
                <span className="font-medium">{total}</span> open roles
                {totalPages > 1 && <> — Page {pageNum} of {totalPages}</>}
            </p>

            {jobs.length === 0 ? (
                <p>No open roles in this category right now.</p>
            ) : (
                <ul className="space-y-4">
                    {jobs.map(job => {
                        const alreadyApplied = appliedIds.has(job.id);
                        return (
                            <li key={job.id} className="rounded-lg border p-4 transition hover:shadow-md">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold">{job.title}</h2>
                                        <p className="text-sm text-gray-600">
                                            {job.company} — {job.location}
                                        </p>
                                    </div>
                                    {job.url && (
                                        <Link
                                            href={job.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-3">
                                    {alreadyApplied ? (
                                        <Link
                                            href="/applications"
                                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                                            title="You already applied to this job"
                                        >
                                            View application
                                        </Link>
                                    ) : (
                                        <form action={applyAction}>
                                            <input type="hidden" name="jobId" value={job.id} />
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-900"
                                                title={session ? "Record application" : "Log in to apply"}
                                            >
                                                Apply
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2">
                    <Link
                        href={`/jobs/${selected}?page=${Math.max(1, pageNum - 1)}`}
                        aria-disabled={pageNum === 1}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${pageNum === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                            }`}
                    >
                        ← Prev
                    </Link>

                    {/* Numeric pages (compact) */}
                    {Array.from({ length: totalPages })
                        .slice(
                            Math.max(0, pageNum - 3),
                            Math.max(0, pageNum - 3) + Math.min(totalPages, 5)
                        )
                        .map((_, idx) => {
                            const p = Math.max(1, pageNum - 2) + idx;
                            if (p > totalPages) return null;
                            const active = p === pageNum;
                            return (
                                <Link
                                    key={p}
                                    href={`/jobs/${selected}?page=${p}`}
                                    className={`rounded-lg border px-3 py-1.5 text-sm ${active ? "bg-black text-white border-black" : "hover:bg-gray-50"
                                        }`}
                                >
                                    {p}
                                </Link>
                            );
                        })}

                    <Link
                        href={`/jobs/${selected}?page=${Math.min(totalPages, pageNum + 1)}`}
                        aria-disabled={pageNum === totalPages}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${pageNum === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                            }`}
                    >
                        Next →
                    </Link>
                </nav>
            )}
        </section>
    );
}
