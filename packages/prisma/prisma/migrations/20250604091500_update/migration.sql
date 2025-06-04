/*
  Warnings:

  - You are about to drop the column `ManagerConact` on the `hourlyInfo` table. All the data in the column will be lost.
  - Added the required column `listingShowNo` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hourlyInfo" DROP COLUMN "ManagerConact",
ADD COLUMN     "listingShowNo" TEXT NOT NULL;
