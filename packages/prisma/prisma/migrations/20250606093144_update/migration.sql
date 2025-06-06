/*
  Warnings:

  - You are about to drop the column `adress` on the `VerificationRequest` table. All the data in the column will be lost.
  - Added the required column `city` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `townSector` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationRequest" DROP COLUMN "adress",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "townSector" TEXT NOT NULL;
