// scripts/probe-companies.ts
import { COMPANY_ATS, CompanyAts } from "../src/lib/jobs/companyAts";

async function probeCompany(c: CompanyAts): Promise<string> {
    try {
        if (c.provider === "greenhouse") {
            const url = `https://boards-api.greenhouse.io/v1/boards/${c.token}/jobs?per_page=1`;
            const res = await fetch(url);
            if (res.ok) {
                const data = (await res.json()) as { jobs?: any[] };
                const count = data.jobs?.length ?? 0;
                return `${c.slug.padEnd(15)} GH  ${res.status} (${count} jobs on page 1)`;
            } else {
                return `${c.slug.padEnd(15)} GH  ${res.status}`;
            }
        } else if (c.provider === "lever") {
            const url = `https://api.lever.co/v0/postings/${c.token}?mode=json&limit=1`;
            const res = await fetch(url);
            if (res.ok) {
                const data = (await res.json()) as any[];
                const count = data.length;
                return `${c.slug.padEnd(15)} LV  ${res.status} (${count} jobs on page 1)`;
            } else {
                return `${c.slug.padEnd(15)} LV  ${res.status}`;
            }
        } else {
            return `${c.slug.padEnd(15)} ??  unsupported provider`;
        }
    } catch (err: any) {
        return `${c.slug.padEnd(15)} ERROR ${err.message}`;
    }
}

async function main() {
    for (const c of COMPANY_ATS) {
        const out = await probeCompany(c);
        console.log(out);
    }
}

main().catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
});
