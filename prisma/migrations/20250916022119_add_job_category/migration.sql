-- AlterTable
ALTER TABLE "Job" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "Job_category_postedAt_idx" ON "Job"("category", "postedAt");
