/*
  Warnings:

  - Changed the type of `MaxPrice` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MinPrice` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `security` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `maintenance` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `waterSupply` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `powerBackup` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingShowNo` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalFloor` on the `FlatInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MinPrice` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MaxPrice` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `security` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `maintenance` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `waterSupply` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `powerBackup` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingShowNo` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalFloor` on the `PgInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MinPrice` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MaxPrice` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `security` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `maintenance` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `powerBackup` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `waterSupply` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingShowNo` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalFloor` on the `RoomInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MinPrice` on the `hourlyInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `MaxPrice` on the `hourlyInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalFloor` on the `hourlyInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingShowNo` on the `hourlyInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FlatInfo" DROP COLUMN "MaxPrice",
ADD COLUMN     "MaxPrice" INTEGER NOT NULL,
DROP COLUMN "MinPrice",
ADD COLUMN     "MinPrice" INTEGER NOT NULL,
DROP COLUMN "security",
ADD COLUMN     "security" INTEGER NOT NULL,
DROP COLUMN "maintenance",
ADD COLUMN     "maintenance" INTEGER NOT NULL,
DROP COLUMN "waterSupply",
ADD COLUMN     "waterSupply" INTEGER NOT NULL,
DROP COLUMN "powerBackup",
ADD COLUMN     "powerBackup" INTEGER NOT NULL,
DROP COLUMN "listingShowNo",
ADD COLUMN     "listingShowNo" INTEGER NOT NULL,
DROP COLUMN "totalFloor",
ADD COLUMN     "totalFloor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" DROP COLUMN "MinPrice",
ADD COLUMN     "MinPrice" INTEGER NOT NULL,
DROP COLUMN "MaxPrice",
ADD COLUMN     "MaxPrice" INTEGER NOT NULL,
DROP COLUMN "security",
ADD COLUMN     "security" INTEGER NOT NULL,
DROP COLUMN "maintenance",
ADD COLUMN     "maintenance" INTEGER NOT NULL,
DROP COLUMN "waterSupply",
ADD COLUMN     "waterSupply" INTEGER NOT NULL,
DROP COLUMN "powerBackup",
ADD COLUMN     "powerBackup" INTEGER NOT NULL,
DROP COLUMN "listingShowNo",
ADD COLUMN     "listingShowNo" INTEGER NOT NULL,
DROP COLUMN "totalFloor",
ADD COLUMN     "totalFloor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" DROP COLUMN "MinPrice",
ADD COLUMN     "MinPrice" INTEGER NOT NULL,
DROP COLUMN "MaxPrice",
ADD COLUMN     "MaxPrice" INTEGER NOT NULL,
DROP COLUMN "security",
ADD COLUMN     "security" INTEGER NOT NULL,
DROP COLUMN "maintenance",
ADD COLUMN     "maintenance" INTEGER NOT NULL,
DROP COLUMN "powerBackup",
ADD COLUMN     "powerBackup" INTEGER NOT NULL,
DROP COLUMN "waterSupply",
ADD COLUMN     "waterSupply" INTEGER NOT NULL,
DROP COLUMN "listingShowNo",
ADD COLUMN     "listingShowNo" INTEGER NOT NULL,
DROP COLUMN "totalFloor",
ADD COLUMN     "totalFloor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "hourlyInfo" DROP COLUMN "MinPrice",
ADD COLUMN     "MinPrice" INTEGER NOT NULL,
DROP COLUMN "MaxPrice",
ADD COLUMN     "MaxPrice" INTEGER NOT NULL,
DROP COLUMN "totalFloor",
ADD COLUMN     "totalFloor" INTEGER NOT NULL,
DROP COLUMN "listingShowNo",
ADD COLUMN     "listingShowNo" INTEGER NOT NULL;
