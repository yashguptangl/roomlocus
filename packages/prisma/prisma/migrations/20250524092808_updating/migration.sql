/*
  Warnings:

  - You are about to drop the column `latitude` on the `FlatInfo` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `FlatInfo` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `PgInfo` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `PgInfo` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `RoomInfo` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `RoomInfo` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `hourlyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `hourlyInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FlatInfo" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "PgInfo" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "RoomInfo" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "hourlyInfo" DROP COLUMN "latitude",
DROP COLUMN "longitude";
