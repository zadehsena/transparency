-- CreateEnum
CREATE TYPE "public"."JobCategory" AS ENUM ('software', 'data_analytics', 'product_management', 'design', 'devops_sre', 'security', 'qa', 'it_support', 'marketing', 'sales', 'operations', 'finance', 'hr', 'legal', 'other');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('north_america', 'europe', 'asia', 'oceania', 'latin_america', 'middle_east', 'africa', 'remote', 'global');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('applied', 'interview', 'offer', 'rejected');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthdate" TIMESTAMP(3),
    "location" TEXT,
    "level" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InterestGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subtopics" JSONB,

    CONSTRAINT "InterestGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "medianResponseDays" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeesLow" INTEGER,
    "employeesHigh" INTEGER,
    "medianBaseSalaryUSD" INTEGER,
    "medianTCSalaryUSD" INTEGER,
    "foundedYear" INTEGER,
    "hqCity" TEXT,
    "overallResponseRate" INTEGER,
    "totalApplications" INTEGER,
    "industry" TEXT,
    "hqCountry" TEXT,
    "website" TEXT,
    "stockTicker" TEXT,
    "stockExchange" TEXT,
    "domain" TEXT,
    "revenueUSD" INTEGER,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "responses" INTEGER NOT NULL DEFAULT 0,
    "interviews" INTEGER NOT NULL DEFAULT 0,
    "offers" INTEGER NOT NULL DEFAULT 0,
    "medianResponseDays" INTEGER,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "ats" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "businessUnitId" TEXT,
    "category" "public"."JobCategory",
    "region" "public"."Region",

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchEvent" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'applied',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstResponseAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "yearsExperience" INTEGER,
    "skills" JSONB,
    "industries" JSONB,
    "notifications" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "educationSchool" TEXT,
    "educationDegree" TEXT,
    "educationField" TEXT,
    "educationGraduationYear" INTEGER,
    "currentCompany" TEXT,
    "currentTitle" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "InterestGroup_userId_idx" ON "public"."InterestGroup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InterestGroup_userId_category_key" ON "public"."InterestGroup"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "public"."Company"("slug");

-- CreateIndex
CREATE INDEX "Job_companyId_postedAt_idx" ON "public"."Job"("companyId", "postedAt");

-- CreateIndex
CREATE INDEX "Job_category_postedAt_idx" ON "public"."Job"("category", "postedAt");

-- CreateIndex
CREATE INDEX "Job_region_idx" ON "public"."Job"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Job_ats_externalId_key" ON "public"."Job"("ats", "externalId");

-- CreateIndex
CREATE INDEX "SearchEvent_slug_createdAt_idx" ON "public"."SearchEvent"("slug", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_createdAt_idx" ON "public"."SearchEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_createdAt_idx" ON "public"."Application"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "public"."Application"("status");

-- AddForeignKey
ALTER TABLE "public"."InterestGroup" ADD CONSTRAINT "InterestGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessUnit" ADD CONSTRAINT "BusinessUnit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "public"."BusinessUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchEvent" ADD CONSTRAINT "SearchEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
