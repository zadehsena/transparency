/*
  Warnings:

  - You are about to drop the column `ceoName` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `fundingSummary` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `fundingTotalUSD` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stockExchange` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stockTicker` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "ceoName",
DROP COLUMN "fundingSummary",
DROP COLUMN "fundingTotalUSD",
DROP COLUMN "isPublic",
DROP COLUMN "stockExchange",
DROP COLUMN "stockTicker";
