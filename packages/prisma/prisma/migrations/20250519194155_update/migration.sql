-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_FlatInfo_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_PgInfo_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_RoomInfo_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_hourlyInfo_listingId_fkey";

-- DropIndex
DROP INDEX "Wishlist_userId_idx";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'agent';

-- AlterTable
ALTER TABLE "FlatInfo" ADD COLUMN     "postPropertyByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'owner';

-- AlterTable
ALTER TABLE "PgInfo" ADD COLUMN     "postPropertyByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RoomInfo" ADD COLUMN     "postPropertyByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "hourlyInfo" ADD COLUMN     "postPropertyByAdmin" BOOLEAN NOT NULL DEFAULT false;
