// scripts/enrich-company.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { COMPANY_DOMAINS } from "../src/lib/companyDomains";

const ABSTRACT_API_KEY = process.env.ABSTRACT_COMPANY_API_KEY;

type AbstractCompany = {
    domain: string | null;
    company_name: string | null;
    year_founded: number | string | null;
    city: string | null;
    country: string | null;
    industry: string | null;
    employee_count: number | null;
    annual_revenue: number | string | null;
    type: string | null; // "public" | "private"
    ticker: string | null;
    exchange: string | null;

    // social links
    linkedin_url?: string | null;
    twitter_url?: string | null;
};

async function fetchAbstractCompany(domain: string): Promise<AbstractCompany | null> {
    if (!ABSTRACT_API_KEY) {
        console.error("ABSTRACT_COMPANY_API_KEY is not set");
        return null;
    }

    const url = new URL("https://companyenrichment.abstractapi.com/v2/");
    url.searchParams.set("api_key", ABSTRACT_API_KEY);
    url.searchParams.set("domain", domain);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) {
            const body = await res.text();
            console.error(`⚠️ Abstract API error for ${domain}: ${res.status} ${body}`);
            return null;
        }

        return (await res.json()) as AbstractCompany;
    } catch (err) {
        console.error(`❌ Error calling Abstract API for ${domain}:`, err);
        return null;
    }
}

function roundEmployees(count: number | null): number | null {
    if (!count) return null;
    return Math.round(count / 100) * 100;
}


function ensureHttps(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

async function enrichOne(slug: string, domain: string) {
    const company = await prisma.company.findUnique({
        where: { slug: slug.toLowerCase() },
    });

    if (!company) {
        console.warn(`⚠️ Skipping "${slug}" — no Company row exists yet.`);
        return;
    }

    console.log(`🔍 Enriching ${slug} (${domain})...`);

    const data = await fetchAbstractCompany(domain);
    if (!data) {
        console.warn(`⚠️ No data for ${slug}`);
        return;
    }

    const roundedEmployees = roundEmployees(data.employee_count);

    // 🔢 Safely parse founded year to Int (or null)
    const foundedYear =
        company.foundedYear ??
        (data.year_founded != null
            ? typeof data.year_founded === "number"
                ? data.year_founded
                : Number.parseInt(data.year_founded, 10) || null
            : null);

    // 💰 Safely parse revenue and avoid INT overflow
    let rawRevenue: number | null = null;
    if (typeof data.annual_revenue === "number") {
        rawRevenue = data.annual_revenue;
    } else if (typeof data.annual_revenue === "string") {
        const parsed = Number.parseInt(data.annual_revenue, 10);
        rawRevenue = Number.isNaN(parsed) ? null : parsed;
    }

    // Prisma Int max is ~2.1B; be conservative
    const safeRevenue =
        rawRevenue && rawRevenue > 0 && rawRevenue <= 2_000_000_000
            ? rawRevenue
            : null;

    await prisma.company.update({
        where: { id: company.id },
        data: {
            // Only fill missing fields
            hqCity: company.hqCity ?? data.city ?? null,
            hqCountry: company.hqCountry ?? data.country ?? null,
            foundedYear,
            industry: company.industry ?? data.industry ?? null,

            // single employees field, rounded to nearest 100
            employees: company.employees ?? roundedEmployees,

            // domain + website
            domain: company.domain ?? data.domain ?? domain,
            website:
                company.website ??
                (data.domain ? `https://${data.domain}` : `https://${domain}`),

            // socials (already doing what you want)
            linkedinUrl:
                company.linkedinUrl ?? ensureHttps(data.linkedin_url ?? null),
            twitterUrl:
                company.twitterUrl ?? ensureHttps(data.twitter_url ?? null),
        },
    });


    console.log(`✅ Updated ${slug}`);
}

async function main() {
    const slugFilter = process.argv[2]; // optional CLI arg

    const entries = slugFilter
        ? Object.entries(COMPANY_DOMAINS).filter(([slug]) => slug === slugFilter)
        : Object.entries(COMPANY_DOMAINS);

    for (const [slug, domain] of entries) {
        try {
            await enrichOne(slug, domain);
            // Be nice to the API
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
            console.error(`❌ Error enriching ${slug}:`, err);
        }
    }

    await prisma.$disconnect();
    console.log("🎉 Enrichment complete!");
}

main().catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
});
