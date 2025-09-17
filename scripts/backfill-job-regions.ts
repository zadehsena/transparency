/* eslint-disable no-console */
import { PrismaClient, Region } from "@prisma/client";
// Use *relative* import so ts-node works
import { regionFromLocation } from "../src/lib/geo/regionFromLocation";

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

async function main() {
    const startingNull = await prisma.job.count({ where: { region: null } });
    console.log(`Jobs with NULL region (start): ${startingNull}`);

    let processed = 0;
    for (; ;) {
        // Always fetch the *current* next batch of NULLs – no skip!
        const jobs = await prisma.job.findMany({
            where: { region: null },
            select: { id: true, location: true },
            orderBy: { id: "asc" },
            take: BATCH_SIZE,
        });

        if (jobs.length === 0) break;

        // Prepare updates (map location → region; fallback to "global")
        const tx = jobs.map(({ id, location }) => {
            const loc = (location ?? "").trim();
            const r = regionFromLocation(loc) as Region | null | undefined;
            const region: Region = r ?? "global";
            return prisma.job.update({ where: { id }, data: { region } });
        });

        await prisma.$transaction(tx);
        processed += jobs.length;
        const remaining = await prisma.job.count({ where: { region: null } });
        console.log(`Updated ${processed} | Remaining NULL: ${remaining}`);
    }

    // Show post-backfill counts (all rows)
    const after = await prisma.job.groupBy({ by: ["region"], _count: { _all: true } });
    console.log("Counts by region after backfill:");
    for (const row of after) console.log(row.region, row._count._all);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
