import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { COMPANY_ATS } from '@/lib/jobs/companyAts';
import { fetchGreenhouse } from '@/lib/jobs/greenhouse';
import { fetchLever } from '@/lib/jobs/lever';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Use POST to run a sync.' });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const onlySlug = (url.searchParams.get("slug") || "").trim(); // optional single-company sync

    const configs = COMPANY_ATS.filter(c => (onlySlug ? c.slug === onlySlug : true));
    const results: Array<{ slug: string; provider: string; upserted: number; closed: number; note?: string }> = [];

    for (const cfg of configs) {
      const company = await prisma.company.findUnique({ where: { slug: cfg.slug } });
      if (!company) {
        results.push({ slug: cfg.slug, provider: cfg.provider, upserted: 0, closed: 0, note: "company not found" });
        continue;
      }

      // ensure a General BU exists + get its id
      const generalBu =
        (await prisma.businessUnit.findFirst({ where: { companyId: company.id, name: "General" }, select: { id: true } }))
        ?? (await prisma.businessUnit.create({
          data: { name: "General", companyId: company.id, applications: 0, responses: 0, interviews: 0, offers: 0 },
          select: { id: true },
        }));

      // fetch postings
      let rows: Array<{
        externalId: string;
        title: string;
        location?: string;
        url?: string | null;
        postedAt?: string | Date;
        unit?: string | null; // optional BU name
      }> = [];

      try {
        rows = cfg.provider === "greenhouse"
          ? await fetchGreenhouse(cfg.token)
          : await fetchLever(cfg.token);
      } catch (err) {
        // If fetch fails, skip closing to avoid nuking open jobs by mistake.
        results.push({ slug: cfg.slug, provider: cfg.provider, upserted: 0, closed: 0, note: `fetch failed: ${(err as Error)?.message ?? err}` });
        continue;
      }

      const seen = new Set<string>();
      let upserted = 0;

      for (const r of rows) {
        if (!r?.externalId || !r?.title) continue;
        seen.add(r.externalId);

        const bu = r.unit
          ? await prisma.businessUnit.findFirst({ where: { companyId: company.id, name: r.unit }, select: { id: true } })
          : null;

        await prisma.job.upsert({
          where: { ats_externalId: { ats: cfg.provider, externalId: r.externalId } },
          update: {
            title: r.title,
            company: company.name, // legacy text field
            location: r.location || "",
            url: r.url ?? null,
            postedAt: r.postedAt ? new Date(r.postedAt) : new Date(),
            source: "ats",
            companyId: company.id,
            businessUnitId: bu?.id ?? generalBu.id, // default to General
            closed: false,
          },
          create: {
            title: r.title,
            company: company.name,
            location: r.location || "",
            url: r.url ?? null,
            postedAt: r.postedAt ? new Date(r.postedAt) : new Date(),
            source: "ats",
            ats: cfg.provider,
            externalId: r.externalId,
            companyId: company.id,
            businessUnitId: bu?.id ?? generalBu.id,
            closed: false,
          },
        });

        upserted++;
      }

      // Close postings that disappeared — but only if we successfully fetched rows
      // If rows.length === 0, we still proceed (company may truly have 0 openings).
      // If you want to be extra safe, require a minimum number or add an allowlist per provider.
      const toClose =
        rows
          ? await prisma.job.findMany({
            where: { companyId: company.id, ats: cfg.provider, closed: false },
            select: { id: true, externalId: true },
          }).then(list => list.filter(j => !seen.has(j.externalId)))
          : [];

      let closed = 0;
      if (toClose.length > 0) {
        await prisma.job.updateMany({
          where: { id: { in: toClose.map(j => j.id) } },
          data: { closed: true },
        });
        closed = toClose.length;
      }

      results.push({ slug: cfg.slug, provider: cfg.provider, upserted, closed });
      revalidatePath(`/company/${cfg.slug}`);
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("sync-jobs failed:", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

