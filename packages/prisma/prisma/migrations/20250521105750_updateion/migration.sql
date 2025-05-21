/*
  Warnings:

  - Added the required column `APIAddress` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `APIAddress` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `APIAddress` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `APIAddress` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlatInfo" ADD COLUMN     "APIAddress" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" ADD COLUMN     "APIAddress" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" ADD COLUMN     "APIAddress" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "hourlyInfo" ADD COLUMN     "APIAddress" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
