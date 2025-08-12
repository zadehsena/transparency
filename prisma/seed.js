// prisma/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  // Insert mock jobs
  await prisma.job.createMany({
    data: [
      {
        title: "Frontend Engineer",
        company: "Acme Corp",
        location: "Remote (US)",
        source: "Greenhouse",
        url: "https://example.com/acme-frontend",
        ats: "Greenhouse",
      },
      {
        title: "Backend Engineer",
        company: "Globex Corporation",
        location: "New York, NY",
        source: "Lever",
        url: "https://example.com/globex-backend",
        ats: "Lever",
      },
      {
        title: "Site Reliability Engineer",
        company: "Initech",
        location: "Remote",
        source: "Workday",
        url: "https://example.com/initech-sre",
        ats: "Workday",
      },
    ],
  });

  console.log("✅ Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
