/*
  Warnings:

  - You are about to drop the column `APIAddress` on the `FlatInfo` table. All the data in the column will be lost.
  - You are about to drop the column `APIAddress` on the `PgInfo` table. All the data in the column will be lost.
  - You are about to drop the column `APIAddress` on the `RoomInfo` table. All the data in the column will be lost.
  - You are about to drop the column `APIAddress` on the `hourlyInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FlatInfo" DROP COLUMN "APIAddress";

-- AlterTable
ALTER TABLE "PgInfo" DROP COLUMN "APIAddress";

-- AlterTable
ALTER TABLE "RoomInfo" DROP COLUMN "APIAddress";

-- AlterTable
ALTER TABLE "hourlyInfo" DROP COLUMN "APIAddress";
