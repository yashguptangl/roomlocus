/*
  Warnings:

  - You are about to drop the column `adress` on the `ContactLog` table. All the data in the column will be lost.
  - Added the required column `city` to the `ContactLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `townSector` to the `ContactLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactLog" DROP COLUMN "adress",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "townSector" TEXT NOT NULL;
