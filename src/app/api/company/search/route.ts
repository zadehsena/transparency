import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "8", 10), 20);

  if (qRaw.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const q = qRaw;               // original (for name contains)
  const qSlug = qRaw.toLowerCase(); // normalized (for slug contains)

  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { slug: { contains: qSlug } }, 
        { name: { contains: q } }, 
      ],
    },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
    take: limit,
  });

  return NextResponse.json({ items: companies });
}
