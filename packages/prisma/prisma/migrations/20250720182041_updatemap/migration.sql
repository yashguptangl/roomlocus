/*
  Warnings:

  - Added the required column `AdressByAPI` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AdressByAPI` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AdressByAPI` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AdressByAPI` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `hourlyInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlatInfo" ADD COLUMN     "AdressByAPI" TEXT NOT NULL,
ADD COLUMN     "isLiveLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "listingShowNo" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "PgInfo" ADD COLUMN     "AdressByAPI" TEXT NOT NULL,
ADD COLUMN     "isLiveLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "listingShowNo" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RoomInfo" ADD COLUMN     "AdressByAPI" TEXT NOT NULL,
ADD COLUMN     "isLiveLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "listingShowNo" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "hourlyInfo" ADD COLUMN     "AdressByAPI" TEXT NOT NULL,
ADD COLUMN     "isLiveLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "listingShowNo" SET DATA TYPE BIGINT;
