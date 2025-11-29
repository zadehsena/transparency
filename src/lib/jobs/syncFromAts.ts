// src/lib/jobs/syncFromAts.ts
import { prisma } from "../prisma";
import { COMPANY_ATS } from "./companyAts";
import { fetchGreenhouse } from "./greenhouse";
import { categorizeJobTitle } from "./classify";
import type { JobCategory } from "@prisma/client";

export async function syncJobs(onlySlug?: string) {
    const configs = COMPANY_ATS.filter((c) => (onlySlug ? c.slug === onlySlug : true));
    const results: Array<{
        slug: string;
        provider: string;
        upserted: number;
        closed: number;
        note?: string;
    }> = [];

    for (const cfg of configs) {
        console.log(`\n🔄 Starting sync for ${cfg.slug} (${cfg.provider})`);

        const company = await prisma.company.findUnique({ where: { slug: cfg.slug } });
        if (!company) {
            console.warn(`  ❌ Company not found: ${cfg.slug}`);
            results.push({
                slug: cfg.slug,
                provider: cfg.provider,
                upserted: 0,
                closed: 0,
                note: "company not found",
            });
            continue;
        }

        const generalBu =
            (await prisma.businessUnit.findFirst({
                where: { companyId: company.id, name: "General" },
                select: { id: true },
            })) ??
            (await prisma.businessUnit.create({
                data: {
                    name: "General",
                    companyId: company.id,
                    applications: 0,
                    responses: 0,
                    interviews: 0,
                    offers: 0,
                },
                select: { id: true },
            }));

        let rows: Array<{
            externalId: string;
            title: string;
            location?: string;
            url?: string | null;
            postedAt?: string | Date;
            unit?: string | null;
            category?: JobCategory | undefined;
            descriptionHtml?: string | null;
        }> = [];

        try {
            console.log(`  ⏳ Fetching jobs from Greenhouse for ${cfg.slug}…`);
            rows = await fetchGreenhouse(cfg.token);
            console.log(`  📝 Retrieved ${rows.length} jobs for ${cfg.slug}`);
        } catch (err) {
            console.error(`  ❌ Fetch failed for ${cfg.slug}:`, err);
            results.push({
                slug: cfg.slug,
                provider: cfg.provider,
                upserted: 0,
                closed: 0,
                note: `fetch failed: ${(err as Error)?.message ?? err}`,
            });
            continue;
        }

        const seen = new Set<string>();
        let upserted = 0;
        let processed = 0;

        for (const r of rows) {
            processed++;
            // periodic progress log
            if (processed % 25 === 0 || processed === rows.length) {
                console.log(
                    `  → Upsert progress for ${cfg.slug}: ${processed}/${rows.length}`
                );
            }

            if (!r?.externalId || !r?.title) continue;
            seen.add(r.externalId);

            const bu = r.unit
                ? await prisma.businessUnit.findFirst({
                    where: { companyId: company.id, name: r.unit },
                    select: { id: true },
                })
                : null;

            const category: JobCategory | undefined =
                r.category ?? (categorizeJobTitle(r.title) as JobCategory);

            await prisma.job.upsert({
                where: {
                    ats_externalId: { ats: cfg.provider, externalId: r.externalId },
                },
                update: {
                    title: r.title,
                    company: company.name,
                    location: r.location || "",
                    url: r.url ?? null,
                    postedAt: r.postedAt ? new Date(r.postedAt) : new Date(),
                    source: "ats",
                    companyId: company.id,
                    businessUnitId: bu?.id ?? generalBu.id,
                    closed: false,
                    category,
                    descriptionHtml: r.descriptionHtml ?? null,
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
                    category,
                    descriptionHtml: r.descriptionHtml ?? null,
                },
            });

            upserted++;
        }

        console.log(`  ✅ Upserted ${upserted} jobs for ${cfg.slug}`);

        const toClose = await prisma.job
            .findMany({
                where: { companyId: company.id, ats: cfg.provider, closed: false },
                select: { id: true, externalId: true },
            })
            .then((list) => list.filter((j) => !seen.has(j.externalId)));

        let closed = 0;
        if (toClose.length > 0) {
            console.log(`  ⚠️ Closing ${toClose.length} stale jobs for ${cfg.slug}…`);
            await prisma.job.updateMany({
                where: { id: { in: toClose.map((j) => j.id) } },
                data: {
                    closed: true,
                    closedAt: new Date(),
                },
            });
            closed = toClose.length;
            console.log(`  ✅ Closed ${closed} jobs for ${cfg.slug}`);
        } else {
            console.log(`  ✅ No stale jobs to close for ${cfg.slug}`);
        }

        results.push({ slug: cfg.slug, provider: cfg.provider, upserted, closed });
        console.log(`✔️ Finished sync for ${cfg.slug}`);
    }

    return { ok: true, results };
}
