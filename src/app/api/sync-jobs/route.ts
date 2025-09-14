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

export async function POST() {
  try {
    const results: Array<{ slug: string; provider: string; inserted: number }> = [];

    for (const cfg of COMPANY_ATS) {
      const company = await prisma.company.findUnique({ where: { slug: cfg.slug } });
      if (!company) {
        results.push({ slug: cfg.slug, provider: cfg.provider, inserted: 0 });
        continue;
      }

      const rows =
        cfg.provider === 'greenhouse'
          ? await fetchGreenhouse(cfg.token)
          : await fetchLever(cfg.token);

      const seen = new Set(rows.map(r => `${cfg.provider}:${r.externalId}`));

      for (const r of rows) {
        const bu = r.unit
          ? await prisma.businessUnit.findFirst({ where: { companyId: company.id, name: r.unit } })
          : null;

        await prisma.job.upsert({
          where: { ats_externalId: { ats: cfg.provider, externalId: r.externalId } },
          update: {
            title: r.title,
            company: company.name,                // ← REQUIRED
            location: r.location || '',
            url: r.url || null,
            postedAt: r.postedAt ? new Date(r.postedAt) : new Date(),
            source: 'ats',
            companyId: company.id,
            businessUnitId: bu?.id ?? null,
            closed: false,
          },
          create: {
            title: r.title,
            company: company.name,                // ← REQUIRED
            location: r.location || '',
            url: r.url || null,
            postedAt: r.postedAt ? new Date(r.postedAt) : new Date(),
            source: 'ats',
            ats: cfg.provider,
            externalId: r.externalId,
            companyId: company.id,
            businessUnitId: bu?.id ?? null,
            closed: false,
          },
        });
      }

      await prisma.job.updateMany({
        where: {
          companyId: company.id,
          ats: cfg.provider,
          NOT: {
            OR: Array.from(seen).map(k => {
              const [ats, externalId] = k.split(':');
              return { ats, externalId };
            }),
          },
        },
        data: { closed: true },
      });

      results.push({ slug: cfg.slug, provider: cfg.provider, inserted: rows.length });
      revalidatePath(`/company/${cfg.slug}`);
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("sync-jobs failed:", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
