/*
  Warnings:

  - A unique constraint covering the columns `[userId,jobId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Application_userId_jobId_idx";

-- AlterTable
ALTER TABLE "public"."Application" ALTER COLUMN "status" SET DEFAULT 'clicked';

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "public"."Application"("userId", "jobId");
