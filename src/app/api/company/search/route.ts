// src/app/api/company/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toInt(v: string | null, d: number) {
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

function titleCase(s: string) {
  return s
    .split(/\s+|-/g)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(toInt(url.searchParams.get("limit"), 8), 20);

  if (!qRaw) return NextResponse.json({ items: [] });

  const qLower = qRaw.toLowerCase();
  const variants = Array.from(new Set([qRaw, qLower, qRaw.toUpperCase(), titleCase(qRaw)]));

  const companies = await prisma.company.findMany({
    where: {
      OR: [
        // slug search (always lower)
        { slug: { contains: qLower } },
        // name search with a few common case variants
        ...variants.map((v) => ({ name: { contains: v } })),
      ],
      // IMPORTANT: don't require jobs here, or freshly seeded companies won't appear
      // jobs: { some: {} }  // ⟵ leave this OUT
    },
    select: { slug: true, name: true },
    orderBy: [{ name: "asc" }],
    take: limit,
  });

  const res = NextResponse.json({ items: companies });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
