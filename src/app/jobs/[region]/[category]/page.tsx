// src/app/jobs/[region]/[category]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER, LABEL, CATEGORY_ICONS } from "@/lib/jobs/categoryMeta";
import { parseRegionParam, REGION_LABEL } from "@/lib/jobs/regionMeta";
import type { JobCategory } from "@prisma/client";

// ✅ server-side session check
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type PageProps = {
    params: Promise<{ region: string; category: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const CAT_STYLES: Record<string, { badgeBg: string; badgeText: string; ring: string }> = {
    software: { badgeBg: "bg-indigo-50 dark:bg-indigo-900/30", badgeText: "text-indigo-700 dark:text-indigo-300", ring: "ring-indigo-100 dark:ring-indigo-900/50" },
    data_analytics: { badgeBg: "bg-sky-50 dark:bg-sky-900/30", badgeText: "text-sky-700 dark:text-sky-300", ring: "ring-sky-100 dark:ring-sky-900/50" },
    product_management: { badgeBg: "bg-amber-50 dark:bg-amber-900/30", badgeText: "text-amber-700 dark:text-amber-300", ring: "ring-amber-100 dark:ring-amber-900/50" },
    design: { badgeBg: "bg-pink-50 dark:bg-pink-900/30", badgeText: "text-pink-700 dark:text-pink-300", ring: "ring-pink-100 dark:ring-pink-900/50" },
    devops_sre: { badgeBg: "bg-emerald-50 dark:bg-emerald-900/30", badgeText: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-100 dark:ring-emerald-900/50" },
    security: { badgeBg: "bg-red-50 dark:bg-red-900/30", badgeText: "text-red-700 dark:text-red-300", ring: "ring-red-100 dark:ring-red-900/50" },
    qa: { badgeBg: "bg-violet-50 dark:bg-violet-900/30", badgeText: "text-violet-700 dark:text-violet-300", ring: "ring-violet-100 dark:ring-violet-900/50" },
    it_support: { badgeBg: "bg-slate-50 dark:bg-slate-800/50", badgeText: "text-slate-700 dark:text-slate-300", ring: "ring-slate-100 dark:ring-slate-800" },
    marketing: { badgeBg: "bg-fuchsia-50 dark:bg-fuchsia-900/30", badgeText: "text-fuchsia-700 dark:text-fuchsia-300", ring: "ring-fuchsia-100 dark:ring-fuchsia-900/50" },
    sales: { badgeBg: "bg-orange-50 dark:bg-orange-900/30", badgeText: "text-orange-700 dark:text-orange-300", ring: "ring-orange-100 dark:ring-orange-900/50" },
    operations: { badgeBg: "bg-teal-50 dark:bg-teal-900/30", badgeText: "text-teal-700 dark:text-teal-300", ring: "ring-teal-100 dark:ring-teal-900/50" },
    finance: { badgeBg: "bg-yellow-50 dark:bg-yellow-900/30", badgeText: "text-yellow-700 dark:text-yellow-300", ring: "ring-yellow-100 dark:ring-yellow-900/50" },
    hr: { badgeBg: "bg-rose-50 dark:bg-rose-900/30", badgeText: "text-rose-700 dark:text-rose-300", ring: "ring-rose-100 dark:ring-rose-900/50" },
    legal: { badgeBg: "bg-blue-50 dark:bg-blue-900/30", badgeText: "text-blue-700 dark:text-blue-300", ring: "ring-blue-100 dark:ring-blue-900/50" },
    other: { badgeBg: "bg-gray-50 dark:bg-gray-800/50", badgeText: "text-gray-700 dark:text-gray-300", ring: "ring-gray-100 dark:ring-gray-800" },
};

export default async function RegionCategoryList({ params, searchParams }: PageProps) {
    const { region: regionParam, category } = await params;
    const sp = await searchParams;

    // 🔐 auth: logged in = unblurred stats; logged out = blurred with CTA chip
    const session = await getServerSession(authOptions);
    const isAuthed = !!session?.user;

    const region = parseRegionParam(regionParam);
    if (!region) redirect("/jobs");

    const normalized = (category || "").toLowerCase().replace(/-/g, "_");
    const isValid = (CATEGORY_ORDER as string[]).includes(normalized);
    if (!isValid) redirect(`/jobs/${regionParam}`);
    const selected = normalized as JobCategory;

    const pageRaw = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
    const pageNum = Math.max(1, Number(pageRaw ?? 1) || 1);
    const offset = (pageNum - 1) * PAGE_SIZE;

    const total = await prisma.job.count({
        where: { closed: false, region, category: selected },
    });

    const jobs = await prisma.job.findMany({
        where: { closed: false, region, category: selected },
        orderBy: { postedAt: "desc" },
        skip: offset,
        take: PAGE_SIZE,
    });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const style = CAT_STYLES[selected] ?? CAT_STYLES.other;
    const headerCountText = `${total} ${total === 1 ? "job" : "jobs"}`;

    return (
        <section className="mx-auto max-w-5xl px-6 py-10">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${style.badgeBg} ${style.badgeText} ring-1 ring-inset ${style.ring}`}>
                        <Image
                            src={CATEGORY_ICONS[selected] ?? "/images/categories/other.png"}
                            alt={`${LABEL[selected]} icon`}
                            width={32}
                            height={32}
                            className="rounded-sm"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {LABEL[selected]} · {REGION_LABEL[region]}
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {headerCountText} • Page {pageNum} of {Math.max(1, totalPages)}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/jobs/${encodeURIComponent(regionParam)}`}
                    className="rounded-lg border px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/60"
                >
                    ← All categories
                </Link>
            </div>

            {/* Results */}
            {jobs.length === 0 ? (
                <p className="rounded-xl border bg-white p-6 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    No open roles in this category for {REGION_LABEL[region]} right now.
                </p>
            ) : (
                <ul className="grid gap-4">
                    {jobs.map((job) => {
                        return (
                            <li
                                key={job.id}
                                className={`group relative rounded-xl border bg-white p-5 shadow-sm ring-1 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${style.ring}`}
                            >
                                {/* whole card clickable */}
                                {job.url && (
                                    <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 z-0"
                                        aria-label={`Open job: ${job.title}`}
                                    />
                                )}

                                {/* Top row: left = title/company/meta, right = compact stats */}
                                <div className="flex items-start justify-between gap-4">
                                    {/* LEFT */}
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {job.title}
                                        </h2>
                                        <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                                            {job.company} {job.location ? `— ${job.location}` : ""}
                                            {job.postedAt && (
                                                <>
                                                    {" "}
                                                    <span className="mx-1 text-gray-400">•</span>{" "}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Posted{" "}
                                                        {new Date(job.postedAt).toLocaleDateString(undefined, {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* RIGHT: compact transparency stats with blur + CTA */}
                                    <div className="relative z-10 shrink-0 self-start">
                                        <div
                                            className={`text-xs text-gray-600 dark:text-gray-300 transition ${isAuthed ? "" : "blur-[3px] select-none pointer-events-none"
                                                }`}
                                            aria-hidden={!isAuthed}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span title="Response rate">RR: —</span>
                                                <span className="opacity-40">•</span>
                                                <span title="Median reply time">Median: —</span>
                                                <span className="opacity-40">•</span>
                                                <span title="Interview rate">IR: —</span>
                                                <span className="opacity-40">•</span>
                                                <span title="Offer rate">OR: —</span>
                                            </div>
                                        </div>

                                        {!isAuthed && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Link
                                                    href="/signup"
                                                    className="pointer-events-auto rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm underline decoration-white/60 underline-offset-2 hover:decoration-white"
                                                >
                                                    Sign in to unlock
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/5 dark:group-hover:ring-white/10" />
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2">
                    <Link
                        href={`/jobs/${encodeURIComponent(regionParam)}/${selected}?page=${Math.max(1, pageNum - 1)}`}
                        aria-disabled={pageNum === 1}
                        className={`rounded-lg border px-3 py-2 text-sm transition ${pageNum === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-800/60"} dark:border-gray-800`}
                    >
                        ← Prev
                    </Link>

                    {Array.from({ length: totalPages })
                        .slice(Math.max(0, pageNum - 3), Math.max(0, pageNum - 3) + Math.min(totalPages, 5))
                        .map((_, idx) => {
                            const p = Math.max(1, pageNum - 2) + idx;
                            if (p > totalPages) return null;
                            const active = p === pageNum;
                            return (
                                <Link
                                    key={p}
                                    href={`/jobs/${encodeURIComponent(regionParam)}/${selected}?page=${p}`}
                                    className={`rounded-lg border px-3 py-2 text-sm transition ${active
                                        ? "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:border-gray-800"
                                        }`}
                                >
                                    {p}
                                </Link>
                            );
                        })}

                    <Link
                        href={`/jobs/${encodeURIComponent(regionParam)}/${selected}?page=${Math.min(totalPages, pageNum + 1)}`}
                        aria-disabled={pageNum === totalPages}
                        className={`rounded-lg border px-3 py-2 text-sm transition ${pageNum === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-800/60"} dark:border-gray-800`}
                    >
                        Next →
                    </Link>
                </nav>
            )}
        </section>
    );
}
