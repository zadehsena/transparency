// src/app/jobs/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER, LABEL } from "@/lib/jobs/categoryMeta";

export const dynamic = "force-dynamic";

export default async function JobsIndex() {
  const countsRaw = await prisma.job.groupBy({
    by: ["category"],
    where: { closed: false },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    countsRaw.map(c => [c.category ?? "other", c._count._all])
  ) as Record<string, number>;

  return (
    <section className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Browse by Category</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORY_ORDER.map(cat => (
          <Link
            key={cat}
            href={`/jobs/${cat}`}
            className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium hover:shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/void.png"
                alt=""
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span className="capitalize">{LABEL[cat]}</span>
            </div>
            <span className="text-xs text-gray-500">
              {counts[cat] ?? 0}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
