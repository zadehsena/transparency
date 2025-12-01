-- AlterEnum
ALTER TYPE "public"."ApplicationStatus" ADD VALUE 'clicked';

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Application_userId_jobId_idx" ON "public"."Application"("userId", "jobId");
