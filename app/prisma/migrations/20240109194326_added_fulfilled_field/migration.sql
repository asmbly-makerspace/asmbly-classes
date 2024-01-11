-- AlterTable
ALTER TABLE "NeonEventInstanceRequest" ADD COLUMN     "fulfilled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "NeonEventTypeRequest" ADD COLUMN     "fulfilled" BOOLEAN NOT NULL DEFAULT false;
