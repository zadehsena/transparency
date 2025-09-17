import { PrismaClient } from "@prisma/client";
import { regionFromLocation } from "../src/lib/geo/regionFromLocation";

const prisma = new PrismaClient();

async function main() {
    const batchSize = 200;
    let totalUpdated = 0;

    while (true) {
        const jobs = await prisma.job.findMany({
            where: { region: null },
            take: batchSize,
        });
        if (jobs.length === 0) break;

        const tx = [];
        for (const j of jobs) {
            const region = regionFromLocation(j.location);
            if (!region) continue; // <-- only enqueue if we found a region
            tx.push(
                prisma.job.update({
                    where: { id: j.id },
                    data: { region },
                })
            );
        }

        if (tx.length === 0) break; // nothing to update, stop looping

        await prisma.$transaction(tx);
        totalUpdated += tx.length;
        console.log(`Updated ${tx.length}, total ${totalUpdated}`);
    }

    console.log("✅ Backfill complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());
