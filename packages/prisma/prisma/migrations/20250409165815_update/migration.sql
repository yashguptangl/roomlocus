/*
  Warnings:

  - Added the required column `updatedByOwner` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdmin` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByOwner` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdmin` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByOwner` to the `RoomDayNight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdmin` to the `RoomDayNight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByOwner` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdmin` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlatInfo" ADD COLUMN     "updatedByOwner" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedByAdmin" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" ADD COLUMN     "updatedByOwner" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedByAdmin" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoomDayNight" ADD COLUMN     "updatedByOwner" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedByAdmin" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" ADD COLUMN     "updatedByOwner" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedByAdmin" TIMESTAMP(3) NOT NULL;
