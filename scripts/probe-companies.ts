// scripts/probe-companies.ts
import { COMPANY_ATS, CompanyAts } from "../src/lib/jobs/companyAts";

async function probeCompany(
    c: CompanyAts
): Promise<{ line: string; ok: boolean; jobs: number }> {
    try {
        if (c.provider === "greenhouse") {
            const url = `https://boards-api.greenhouse.io/v1/boards/${c.token}/jobs?per_page=1`;
            const res = await fetch(url);

            if (res.ok) {
                const data = (await res.json()) as { jobs?: any[] };
                const count = data.jobs?.length ?? 0;

                return {
                    line: `${c.slug.padEnd(15)} GH  ${res.status} (${count} jobs on page 1)`,
                    ok: true,
                    jobs: count,
                };
            } else {
                return {
                    line: `${c.slug.padEnd(15)} GH  ${res.status}`,
                    ok: false,
                    jobs: 0,
                };
            }
        }

        return {
            line: `${c.slug.padEnd(15)} ??  unsupported provider`,
            ok: false,
            jobs: 0,
        };
    } catch (err: any) {
        return {
            line: `${c.slug.padEnd(15)} ERROR ${err.message}`,
            ok: false,
            jobs: 0,
        };
    }
}

async function main() {
    let okCount = 0;
    let totalJobs = 0;

    for (const c of COMPANY_ATS) {
        const { line, ok, jobs } = await probeCompany(c);
        console.log(line);

        if (ok) okCount++;
        totalJobs += jobs;
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Companies returning 200: ${okCount}/${COMPANY_ATS.length}`);
    console.log(`Total jobs counted (page 1 only): ${totalJobs}`);
}

main().catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
});
