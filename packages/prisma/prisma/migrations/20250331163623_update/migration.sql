/*
  Warnings:

  - The `verificationType` column on the `VerificationRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VerifyType" AS ENUM ('SELF', 'AGENT');

-- AlterTable
ALTER TABLE "VerificationRequest" DROP COLUMN "verificationType",
ADD COLUMN     "verificationType" "VerifyType" NOT NULL DEFAULT 'SELF';
