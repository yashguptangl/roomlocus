/*
  Warnings:

  - Added the required column `location` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "location" TEXT NOT NULL;
