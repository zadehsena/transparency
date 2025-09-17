// scripts/set-facts.ts
import { prisma } from "@/lib/prisma";

async function main() {
    await prisma.company.update({
        where: { slug: "oracle" }, // <-- change
        data: {
            employeesLow: 100_000,
            employeesHigh: 160_000,
            medianBaseSalaryUSD: 165_000,
            medianTCSalaryUSD: 240_000,
            foundedYear: 1977,
            hqCity: "Austin, TX",
        },
    });
    console.log("Updated facts for oracle");
}
main().finally(() => prisma.$disconnect());
