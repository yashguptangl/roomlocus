/*
  Warnings:

  - Added the required column `personverifiedName` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDraft` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDraft` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDraft` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "personverifiedName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FlatInfo" ADD COLUMN     "isDraft" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" ADD COLUMN     "isDraft" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" ADD COLUMN     "isDraft" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "RoomDayNight" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL DEFAULT 'RoomDayNight',
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
    "ManagerConact" INTEGER NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isDraft" BOOLEAN NOT NULL,

    CONSTRAINT "RoomDayNight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomDayNight" ADD CONSTRAINT "RoomDayNight_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
