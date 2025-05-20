-- AlterTable
ALTER TABLE "ContactLog" ADD COLUMN     "ownerDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userDeleted" BOOLEAN NOT NULL DEFAULT false;
