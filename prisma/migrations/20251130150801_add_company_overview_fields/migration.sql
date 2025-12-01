/*
  Warnings:

  - You are about to drop the column `medianBaseSalaryUSD` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `medianTCSalaryUSD` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "medianBaseSalaryUSD",
DROP COLUMN "medianTCSalaryUSD",
ADD COLUMN     "ceoName" TEXT,
ADD COLUMN     "fundingSummary" TEXT,
ADD COLUMN     "fundingTotalUSD" INTEGER,
ADD COLUMN     "isPublic" BOOLEAN;
