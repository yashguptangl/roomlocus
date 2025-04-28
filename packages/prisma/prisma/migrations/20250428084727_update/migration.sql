/*
  Warnings:

  - You are about to drop the column `ageofProperty` on the `FlatInfo` table. All the data in the column will be lost.
  - You are about to drop the column `ageofProperty` on the `PgInfo` table. All the data in the column will be lost.
  - You are about to drop the column `ageofProperty` on the `RoomInfo` table. All the data in the column will be lost.
  - You are about to drop the `RoomDayNight` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalFloor` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFloor` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFloor` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoomDayNight" DROP CONSTRAINT "RoomDayNight_ownerId_fkey";

-- AlterTable
ALTER TABLE "FlatInfo" DROP COLUMN "ageofProperty",
ADD COLUMN     "totalFloor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" DROP COLUMN "ageofProperty",
ADD COLUMN     "totalFloor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" DROP COLUMN "ageofProperty",
ADD COLUMN     "totalFloor" TEXT NOT NULL;

-- DropTable
DROP TABLE "RoomDayNight";

-- CreateTable
CREATE TABLE "hourlyInfo" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL DEFAULT 'hourlyroom',
    "city" TEXT NOT NULL,
    "townSector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "palaceName" TEXT NOT NULL,
    "BedCount" INTEGER NOT NULL,
    "MinPrice" TEXT NOT NULL,
    "MaxPrice" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "totalRoom" INTEGER NOT NULL,
    "totalFloor" TEXT NOT NULL,
    "noofGuests" INTEGER NOT NULL,
    "furnishingType" TEXT NOT NULL,
    "accomoType" TEXT NOT NULL,
    "acType" TEXT NOT NULL,
    "parking" TEXT[],
    "foodAvailable" BOOLEAN NOT NULL,
    "preferTenants" TEXT[],
    "genderPrefer" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "roomInside" TEXT[],
    "roomOutside" TEXT[],
    "manager" TEXT NOT NULL,
    "ManagerConact" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isDraft" BOOLEAN NOT NULL,
    "updatedByOwner" TIMESTAMP(3) NOT NULL,
    "verifiedByAdminOrAgent" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hourlyInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hourlyInfo" ADD CONSTRAINT "hourlyInfo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
