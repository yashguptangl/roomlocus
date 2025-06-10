/*
  Warnings:

  - The values [CONFIRMED,CANCELLED,INPROGRESS] on the enum `StatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusType_new" AS ENUM ('PENDING', 'PAY', 'CANCELLED_PAYMENT', 'DONE');
ALTER TABLE "VerificationRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "VerificationRequest" ALTER COLUMN "status" TYPE "StatusType_new" USING ("status"::text::"StatusType_new");
ALTER TYPE "StatusType" RENAME TO "StatusType_old";
ALTER TYPE "StatusType_new" RENAME TO "StatusType";
DROP TYPE "StatusType_old";
ALTER TABLE "VerificationRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
