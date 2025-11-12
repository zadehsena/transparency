/*
  Warnings:

  - You are about to drop the column `desiredSalaryMax` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `desiredSalaryMin` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `headline` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `jobTypes` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `openToWork` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLocations` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `remotePreference` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `salaryCurrency` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `seniority` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `willingToRelocate` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "InterestGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subtopics" JSONB,
    CONSTRAINT "InterestGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "location" TEXT,
    "yearsExperience" INTEGER,
    "skills" JSONB,
    "industries" JSONB,
    "notifications" JSONB,
    "updatedAt" DATETIME NOT NULL,
    "educationSchool" TEXT,
    "educationDegree" TEXT,
    "educationField" TEXT,
    "educationGraduationYear" INTEGER,
    "currentCompany" TEXT,
    "currentTitle" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("currentCompany", "currentTitle", "educationDegree", "educationField", "educationGraduationYear", "educationSchool", "industries", "location", "notifications", "phone", "skills", "updatedAt", "userId", "yearsExperience") SELECT "currentCompany", "currentTitle", "educationDegree", "educationField", "educationGraduationYear", "educationSchool", "industries", "location", "notifications", "phone", "skills", "updatedAt", "userId", "yearsExperience" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthdate" DATETIME,
    "location" TEXT,
    "level" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("birthdate", "createdAt", "email", "firstName", "id", "lastName", "level", "location", "onboardingCompleted", "password", "updatedAt") SELECT "birthdate", "createdAt", "email", "firstName", "id", "lastName", "level", "location", "onboardingCompleted", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "InterestGroup_userId_idx" ON "InterestGroup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InterestGroup_userId_category_key" ON "InterestGroup"("userId", "category");
