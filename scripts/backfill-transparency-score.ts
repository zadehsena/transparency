// scripts/backfillTransparencyScore.ts
import { prisma } from "@/lib/prisma";

async function main() {
    const result = await prisma.company.updateMany({
        where: {
            transparencyScore: null, // only touch companies that don't have a score yet
        },
        data: {
            transparencyScore: 13,
        },
    });

    console.log(`Updated ${result.count} companies with transparencyScore = 13`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
