// prisma/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slugify = (s) =>
  s.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// TEMP
const TOP_TECH = [
  "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "NVIDIA", "Salesforce",
  "Adobe", "Oracle", "Uber", "Airbnb", "Stripe", "Snowflake", "Datadog", "DoorDash",
  "ServiceNow", "Cloudflare", "Coinbase", "Shopify",
];

// TEMP
async function ensureCompanyWithGeneralBU(name) {
  const slug = slugify(name);
  const company = await prisma.company.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
    select: { id: true, slug: true },
  });
  const existingBU = await prisma.businessUnit.findFirst({
    where: { companyId: company.id, name: "General" },
    select: { id: true },
  });
  if (!existingBU) {
    await prisma.businessUnit.create({
      data: {
        name: "General",
        companyId: company.id,
        applications: 0,
        responses: 0,
        interviews: 0,
        offers: 0,
      },
    });
  }
}

async function upsertCompany(name) {
  const slug = slugify(name);
  return prisma.company.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
    select: { id: true, slug: true, name: true },
  });
}

async function ensureGeneralBU(companyId) {
  const existing = await prisma.businessUnit.findFirst({
    where: { companyId, name: "General" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.businessUnit.create({
    data: { name: "General", companyId, applications: 0, responses: 0, interviews: 0, offers: 0 },
    select: { id: true },
  });
  return created.id;
}

async function linkJobsToCompanyAndBU() {
  // Read all jobs (keep it light)
  const jobs = await prisma.job.findMany({
    select: { id: true, company: true, companyId: true, businessUnitId: true },
  });

  // Unique, non-empty company names from legacy text field
  const uniqueNames = Array.from(
    new Set(jobs.map((j) => (j.company || "").trim()).filter((n) => n.length > 0))
  );

  // Create/lookup companies + default BU
  const companyBySlug = new Map(); // slug -> { id, generalBuId }
  for (const name of uniqueNames) {
    const company = await upsertCompany(name);
    const generalBuId = await ensureGeneralBU(company.id);
    companyBySlug.set(company.slug, { id: company.id, generalBuId });
  }

  // Link each job → companyId (via legacy name) and businessUnitId (default General if empty)
  for (const j of jobs) {
    const name = (j.company || "").trim();
    if (!name) continue;
    const slug = slugify(name);
    const info = companyBySlug.get(slug);
    if (!info) continue;

    const data = {};
    if (!j.companyId) data.companyId = info.id;
    if (!j.businessUnitId) data.businessUnitId = info.generalBuId;

    if (Object.keys(data).length) {
      await prisma.job.update({ where: { id: j.id }, data });
    }
  }
}

// Recompute BU stats from Applications
async function recomputeBUStats() {
  // For each BU, count applications + statuses based on linked jobs
  const businessUnits = await prisma.businessUnit.findMany({
    select: { id: true },
  });

  for (const bu of businessUnits) {
    // All jobs in this BU
    const jobsInBu = await prisma.job.findMany({
      where: { businessUnitId: bu.id },
      select: { id: true },
    });
    const jobIds = jobsInBu.map((j) => j.id);

    // If no jobs linked, zero out and continue
    if (jobIds.length === 0) {
      await prisma.businessUnit.update({
        where: { id: bu.id },
        data: { applications: 0, responses: 0, interviews: 0, offers: 0 },
      });
      continue;
    }

    // Counts by status
    const totalApps = await prisma.application.count({
      where: { jobId: { in: jobIds } },
    });
    const responses = await prisma.application.count({
      where: { jobId: { in: jobIds }, status: { in: ["interview", "offer", "rejected"] } }, // “response” = got any outcome
    });
    const interviews = await prisma.application.count({
      where: { jobId: { in: jobIds }, status: "interview" },
    });
    const offers = await prisma.application.count({
      where: { jobId: { in: jobIds }, status: "offer" },
    });

    await prisma.businessUnit.update({
      where: { id: bu.id },
      data: {
        applications: totalApps,
        responses,
        interviews,
        offers,
        // medianResponseDays: leave null or compute if you store response timestamps
      },
    });
  }
}

async function main() {
  // 1) Dynamic: link existing jobs → companies/BU and recompute stats
  await linkJobsToCompanyAndBU();
  await recomputeBUStats();

  // 2) Hardcode: ensure Top Tech companies exist (with a default “General” BU)
  for (const name of TOP_TECH) {
    await ensureCompanyWithGeneralBU(name);
  }

  console.log("✅ Seed complete: jobs linked + stats recomputed + top tech companies ensured.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
