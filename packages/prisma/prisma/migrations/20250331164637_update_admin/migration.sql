/*
  Warnings:

  - Added the required column `listingId` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "listingId" INTEGER NOT NULL;
