// src/app/api/company/[slug]/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toInt(v: string | null, d: number) {
    const n = parseInt(v || "", 10);
    return Number.isFinite(n) && n > 0 ? n : d;
}

type SlugParams = { slug: string };

export async function GET(req: Request, ctx: unknown) {
    const { slug } = (ctx as { params: SlugParams }).params;
    const url = new URL(req.url);

    const page = toInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(toInt(url.searchParams.get("pageSize"), 25), 100);
    const skip = (page - 1) * pageSize;

    // ------------------------------------------------------------
    // ⭐ SPECIAL CASE: /jobs page → slug === "all"
    // ------------------------------------------------------------
    if (slug === "all") {
        const [rows, total] = await Promise.all([
            prisma.job.findMany({
                where: { closed: false },
                orderBy: [{ postedAt: "desc" }, { id: "desc" }],
                include: {
                    businessUnit: true,
                    companyRel: { select: { name: true, slug: true } },
                },
                skip,
                take: pageSize,
            }),
            prisma.job.count({
                where: { closed: false },
            }),
        ]);

        const jobs = rows.map((j) => ({
            id: j.id,
            title: j.title,
            location: j.location,
            url: j.url ?? "",
            postedAt: j.postedAt?.toISOString(),
            unit: j.businessUnit?.name ?? null,
            companyName: j.companyRel?.name ?? null,
            companySlug: j.companyRel?.slug ?? null,
        }));

        const hasNext = skip + jobs.length < total;

        const res = NextResponse.json({
            ok: true,
            page,
            pageSize,
            total,
            hasNext,
            jobs,
        });
        res.headers.set("Cache-Control", "no-store, max-age=0");
        return res;
    }

    // ------------------------------------------------------------
    // ⭐ NORMAL COMPANY-SPECIFIC LOGIC
    // ------------------------------------------------------------
    const company = await prisma.company.findUnique({
        where: { slug },
    });

    if (!company) {
        return NextResponse.json(
            { ok: false, error: "Company not found" },
            { status: 404 }
        );
    }

    const [rows, total] = await Promise.all([
        prisma.job.findMany({
            where: { companyId: company.id, closed: false },
            orderBy: [{ postedAt: "desc" }, { id: "desc" }],
            include: { businessUnit: true },
            skip,
            take: pageSize,
        }),
        prisma.job.count({
            where: { companyId: company.id, closed: false },
        }),
    ]);

    const jobs = rows.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        url: j.url ?? "",
        postedAt: j.postedAt?.toISOString(),
        unit: j.businessUnit?.name,
    }));

    const hasNext = skip + jobs.length < total;

    const res = NextResponse.json({
        ok: true,
        page,
        pageSize,
        total,
        hasNext,
        jobs,
    });

    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
}
