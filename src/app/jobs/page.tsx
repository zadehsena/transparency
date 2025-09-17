// src/app/jobs/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER, LABEL, CATEGORY_ICONS } from "@/lib/jobs/categoryMeta";

export const dynamic = "force-dynamic";

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

export default async function JobsIndex() {
  const countsRaw = await prisma.job.groupBy({
    by: ["category"],
    where: { closed: false },
    _count: { _all: true },
  });

  const counts = Object.fromEntries(
    countsRaw.map((c) => [c.category ?? "other", c._count._all])
  ) as Record<string, number>;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Browse by Category
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Explore open roles across different teams. Click a category to see all current openings.
        </p>
      </header>

      {/* Responsive grid: 1 col on mobile, 2 on sm, 3 on lg */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => {
          const style = CAT_STYLES[cat] ?? CAT_STYLES.other;
          const total = counts[cat] ?? 0;
          return (
            <Link
              key={cat}
              href={`/jobs/${cat}`}
              className={`group relative flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm ring-1 transition
                          hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${style.ring}`}
            >
              {/* Icon badge */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${style.badgeBg} ${style.badgeText} ring-1 ring-inset ${style.ring}`}>
                <Image
                  src={CATEGORY_ICONS[cat] ?? "/images/categories/other.png"}
                  alt={`${LABEL[cat]} icon`}
                  width={28}
                  height={28}
                  className="rounded-sm"
                />
              </div>

              {/* Text column */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                    {LABEL[cat]}
                  </h2>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700">
                    {total} {total === 1 ? "job" : "jobs"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                  {getSubtitle(cat)}
                </p>
              </div>

              {/* Hover accent */}
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/5 dark:group-hover:ring-white/10" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Small helper for category blurbs (optional, tweak as you like)
function getSubtitle(cat: string) {
  switch (cat) {
    case "software":
      return "Backend, frontend, full-stack, platform";
    case "data_analytics":
      return "Analytics, BI, data science, ML ops";
    case "product_management":
      return "Roadmaps, discovery, delivery";
    case "design":
      return "Product, visual, UX/UI, research";
    case "devops_sre":
      return "Infra, reliability, cloud platforms";
    case "security":
      return "AppSec, cloud security, GRC";
    case "qa":
      return "Quality, automation, test engineering";
    case "it_support":
      return "Helpdesk, systems, endpoint mgmt";
    case "marketing":
      return "Growth, content, brand, lifecycle";
    case "sales":
      return "AE, SDR, partnerships";
    case "operations":
      return "Biz ops, program/project mgmt";
    case "finance":
      return "FP&A, accounting, strategy";
    case "hr":
      return "People ops, recruiting, L&D";
    case "legal":
      return "Commercial, privacy, compliance";
    default:
      return "Miscellaneous roles across teams";
  }
}
