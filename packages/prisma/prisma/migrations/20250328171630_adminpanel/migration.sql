/*
  Warnings:

  - You are about to drop the column `listingId` on the `VerificationRequest` table. All the data in the column will be lost.
  - Changed the type of `ownerId` on the `VerificationRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'ADMIN');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "isKYCVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VerificationRequest" DROP COLUMN "listingId",
DROP COLUMN "ownerId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("agentId") ON DELETE SET NULL ON UPDATE CASCADE;
