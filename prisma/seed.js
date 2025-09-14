// prisma/seed.js
require('ts-node/register/transpile-only'); // allow requiring .ts files from JS

const { PrismaClient } = require('@prisma/client');
const { COMPANY_ATS } = require('../src/lib/jobs/companyAts'); // TS module
const prisma = new PrismaClient();

const slugify = (s) =>
  s.trim().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
    where: { companyId, name: 'General' },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.businessUnit.create({
    data: { name: 'General', companyId, applications: 0, responses: 0, interviews: 0, offers: 0 },
    select: { id: true },
  });
  return created.id;
}

async function ensureCompanyWithGeneralBU(nameOrSlug) {
  const slug = slugify(nameOrSlug);
  const company = await prisma.company.upsert({
    where: { slug },
    update: { name: nameOrSlug },
    create: { slug, name: nameOrSlug },
    select: { id: true, slug: true },
  });

  const existingBU = await prisma.businessUnit.findFirst({
    where: { companyId: company.id, name: 'General' },
    select: { id: true },
  });
  if (!existingBU) {
    await prisma.businessUnit.create({
      data: { name: 'General', companyId: company.id, applications: 0, responses: 0, interviews: 0, offers: 0 },
    });
  }
}

async function linkJobsToCompanyAndBU() {
  const jobs = await prisma.job.findMany({
    select: { id: true, company: true, companyId: true, businessUnitId: true },
  });

  const uniqueNames = Array.from(
    new Set(jobs.map((j) => (j.company || '').trim()).filter((n) => n.length > 0))
  );

  const companyBySlug = new Map(); // slug -> { id, generalBuId }
  for (const name of uniqueNames) {
    const company = await upsertCompany(name);
    const generalBuId = await ensureGeneralBU(company.id);
    companyBySlug.set(company.slug, { id: company.id, generalBuId });
  }

  for (const j of jobs) {
    const name = (j.company || '').trim();
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

async function recomputeBUStats() {
  const businessUnits = await prisma.businessUnit.findMany({ select: { id: true } });

  for (const bu of businessUnits) {
    const jobsInBu = await prisma.job.findMany({ where: { businessUnitId: bu.id }, select: { id: true } });
    const jobIds = jobsInBu.map((j) => j.id);

    if (jobIds.length === 0) {
      await prisma.businessUnit.update({
        where: { id: bu.id },
        data: { applications: 0, responses: 0, interviews: 0, offers: 0 },
      });
      continue;
    }

    const totalApps = await prisma.application.count({ where: { jobId: { in: jobIds } } });
    const responses = await prisma.application.count({
      where: { jobId: { in: jobIds }, status: { in: ['interview', 'offer', 'rejected'] } },
    });
    const interviews = await prisma.application.count({ where: { jobId: { in: jobIds }, status: 'interview' } });
    const offers = await prisma.application.count({ where: { jobId: { in: jobIds }, status: 'offer' } });

    await prisma.businessUnit.update({
      where: { id: bu.id },
      data: { applications: totalApps, responses, interviews, offers },
    });
  }
}

async function main() {
  // 1) Link existing jobs → companies/BU and recompute stats
  await linkJobsToCompanyAndBU();
  await recomputeBUStats();

  // 2) Ensure ALL companies from COMPANY_ATS exist (by slug)
  for (const { slug } of COMPANY_ATS) {
    await ensureCompanyWithGeneralBU(slug);
  }

  console.log('✅ Seed complete: jobs linked + stats recomputed + all ATS companies ensured.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
