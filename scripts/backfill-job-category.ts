import { PrismaClient, JobCategory } from "@prisma/client";
import { categorizeJobTitle } from "@/lib/jobs/classify";

const prisma = new PrismaClient();

async function main() {
    const batch = 250;
    for (; ;) {
        const jobs = await prisma.job.findMany({
            where: { category: null },
            select: { id: true, title: true },
            take: batch,
            orderBy: { postedAt: "desc" },
        });
        if (!jobs.length) break;

        await prisma.$transaction(
            jobs.map(j =>
                prisma.job.update({
                    where: { id: j.id },
                    data: { category: categorizeJobTitle(j.title) as JobCategory },
                })
            )
        );
    }
    console.log("Backfill complete");
}

main().finally(() => prisma.$disconnect());
