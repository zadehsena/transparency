/*
  Warnings:

  - You are about to drop the column `employeesHigh` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `employeesLow` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "employeesHigh",
DROP COLUMN "employeesLow",
ADD COLUMN     "employees" INTEGER;
