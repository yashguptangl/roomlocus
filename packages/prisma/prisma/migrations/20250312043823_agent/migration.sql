/*
  Warnings:

  - A unique constraint covering the columns `[agentId]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Agentprogress" DROP CONSTRAINT "Agentprogress_agentId_fkey";

-- DropIndex
DROP INDEX "Agentprogress_agentId_key";

-- AlterTable
ALTER TABLE "Agentprogress" ALTER COLUMN "agentId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agent_agentId_key" ON "Agent"("agentId");

-- AddForeignKey
ALTER TABLE "Agentprogress" ADD CONSTRAINT "Agentprogress_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("agentId") ON DELETE RESTRICT ON UPDATE CASCADE;
