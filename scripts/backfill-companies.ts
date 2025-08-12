import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugifyCompany(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // 1) Read all jobs (id + legacy free-text company)
  const jobs = await prisma.job.findMany({
    select: { id: true, company: true },
  });

  // 2) Unique, non-empty company names
  const uniqueNames: string[] = Array.from(
    new Set(
      jobs
        .map((j) => (j.company ?? "").trim())
        .filter((name) => name.length > 0)
    )
  );

  // 3) Ensure a Company row exists for each; cache by slug
  const slugToCompanyId = new Map<string, string>();

  for (const name of uniqueNames) {
    const slug = slugifyCompany(name);
    // upsert ensures idempotency
    const company = await prisma.company.upsert({
      where: { slug },
      create: { slug, name },
      update: {}, // nothing to update right now
      select: { id: true, slug: true },
    });
    slugToCompanyId.set(company.slug, company.id);
  }

  // 4) Update each job with companyId derived from legacy company string
  for (const j of jobs) {
    const name = (j.company ?? "").trim();
    if (!name) continue;
    const slug = slugifyCompany(name);
    const companyId = slugToCompanyId.get(slug);
    if (!companyId) continue;

    await prisma.job.update({
      where: { id: j.id },
      data: { companyId },
    });
  }

  console.log("✅ Backfill complete.");
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
