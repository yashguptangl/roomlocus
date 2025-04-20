/*
  Warnings:

  - The `status` column on the `VerificationRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `adress` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingShowNo` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "adress" TEXT NOT NULL,
ADD COLUMN     "imagesUploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listingShowNo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusType" NOT NULL DEFAULT 'PENDING';
