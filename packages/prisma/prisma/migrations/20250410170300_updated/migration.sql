/*
  Warnings:

  - You are about to drop the column `verifiedByAdmin` on the `FlatInfo` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedByAdmin` on the `PgInfo` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedByAdmin` on the `RoomDayNight` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedByAdmin` on the `RoomInfo` table. All the data in the column will be lost.
  - Added the required column `verifiedByAdminOrAgent` to the `FlatInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdminOrAgent` to the `PgInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdminOrAgent` to the `RoomDayNight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedByAdminOrAgent` to the `RoomInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlatInfo" DROP COLUMN "verifiedByAdmin",
ADD COLUMN     "verifiedByAdminOrAgent" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PgInfo" DROP COLUMN "verifiedByAdmin",
ADD COLUMN     "verifiedByAdminOrAgent" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoomDayNight" DROP COLUMN "verifiedByAdmin",
ADD COLUMN     "verifiedByAdminOrAgent" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoomInfo" DROP COLUMN "verifiedByAdmin",
ADD COLUMN     "verifiedByAdminOrAgent" TIMESTAMP(3) NOT NULL;
