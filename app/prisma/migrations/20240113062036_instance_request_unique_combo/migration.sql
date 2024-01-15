/*
  Warnings:

  - A unique constraint covering the columns `[eventId,requesterId]` on the table `NeonEventInstanceRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NeonEventInstanceRequest_eventId_requesterId_key" ON "NeonEventInstanceRequest"("eventId", "requesterId");
