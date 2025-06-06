/*
  Warnings:

  - You are about to drop the column `city` on the `ContactLog` table. All the data in the column will be lost.
  - You are about to drop the column `townSector` on the `ContactLog` table. All the data in the column will be lost.
  - Added the required column `landmark` to the `ContactLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `ContactLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactLog" DROP COLUMN "city",
DROP COLUMN "townSector",
ADD COLUMN     "landmark" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "ownerName" TEXT NOT NULL;
