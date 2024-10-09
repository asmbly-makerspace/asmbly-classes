-- DropForeignKey
ALTER TABLE "NeonEventInstanceRequest" DROP CONSTRAINT "NeonEventInstanceRequest_eventId_fkey";

-- DropForeignKey
ALTER TABLE "NeonEventTypeRequest" DROP CONSTRAINT "NeonEventTypeRequest_classTypeId_fkey";

-- AddForeignKey
ALTER TABLE "NeonEventInstanceRequest" ADD CONSTRAINT "NeonEventInstanceRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NeonEventInstance"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventTypeRequest" ADD CONSTRAINT "NeonEventTypeRequest_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "NeonEventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
