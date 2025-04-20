/*
  Warnings:

  - A unique constraint covering the columns `[agentId]` on the table `Agentprogress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Agentprogress_agentId_key" ON "Agentprogress"("agentId");
