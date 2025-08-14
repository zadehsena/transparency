/*
  Warnings:

  - Added the required column `externalId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `ats` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "ats" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "businessUnitId" TEXT,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("ats", "businessUnitId", "company", "companyId", "id", "location", "postedAt", "source", "title", "url") SELECT "ats", "businessUnitId", "company", "companyId", "id", "location", "postedAt", "source", "title", "url" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_companyId_postedAt_idx" ON "Job"("companyId", "postedAt");
CREATE UNIQUE INDEX "Job_ats_externalId_key" ON "Job"("ats", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
