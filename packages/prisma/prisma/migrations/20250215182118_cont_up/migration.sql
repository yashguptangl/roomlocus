/*
  Warnings:

  - Added the required column `ownerName` to the `ContactLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactLog" ADD COLUMN     "ownerName" TEXT NOT NULL;
