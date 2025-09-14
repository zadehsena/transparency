import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { term, slug } = (await req.json()) as { term?: string; slug?: string };
    if (!term || !slug) return NextResponse.json({ ok: false }, { status: 400 });

    // try to attach a companyId if it exists
    const company = await prisma.company.findUnique({
      where: { slug: slug.toLowerCase() },
      select: { id: true },
    });

    await prisma.searchEvent.create({
      data: {
        term: term.slice(0, 200),
        slug: slug.toLowerCase(),
        companyId: company?.id ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /searchEvent failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

}
