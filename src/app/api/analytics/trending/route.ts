import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ?window=7d&limit=10
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);
  const windowStr = url.searchParams.get("window") || "7d";

  const now = new Date();
  const since = new Date(
    windowStr.endsWith("d")
      ? now.getTime() - parseInt(windowStr) * 24 * 3600 * 1000
      : now.getTime() - 7 * 24 * 3600 * 1000
  );

  // group by slug
  const rows = await prisma.searchEvent.groupBy({
    by: ["slug"],
    where: { createdAt: { gte: since } },
    _count: { slug: true },
    orderBy: { _count: { slug: "desc" } },
    take: limit,
  });

  // enrich with company names if present
  const slugs = rows.map(r => r.slug);
  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true },
  });
  const nameBySlug = new Map(companies.map(c => [c.slug, c.name]));

  const data = rows.map(r => ({
    slug: r.slug,
    name: nameBySlug.get(r.slug) ?? r.slug.replace(/-/g, " "),
    count: r._count.slug,
  }));

  return NextResponse.json({ window: windowStr, items: data });
}
