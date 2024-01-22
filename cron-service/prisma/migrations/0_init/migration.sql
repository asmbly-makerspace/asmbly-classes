-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('ONDEMAND', 'NOTIFICATION');

-- CreateTable
CREATE TABLE "NeonEventCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "archCategoriesId" INTEGER,

    CONSTRAINT "NeonEventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsmblyArchCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "AsmblyArchCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonEventTeacher" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "NeonEventTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonBaseRegLink" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "NeonBaseRegLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonEventType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "capacity" SMALLINT NOT NULL,
    "price" REAL NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "NeonEventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonEventInstance" (
    "eventId" INTEGER NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "attendeeCount" SMALLINT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeonEventInstance_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "NeonEventInstanceRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" INTEGER NOT NULL,
    "requesterId" INTEGER NOT NULL,

    CONSTRAINT "NeonEventInstanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonEventRequester" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" VARCHAR(30) NOT NULL,
    "lastName" VARCHAR(30) NOT NULL,

    CONSTRAINT "NeonEventRequester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeonEventTypeRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "classTypeId" INTEGER NOT NULL,
    "requestType" "RequestType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeonEventTypeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NeonEventCategoryToNeonEventType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NeonEventTeacherToNeonEventType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NeonEventCategory_name_key" ON "NeonEventCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AsmblyArchCategory_name_key" ON "AsmblyArchCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NeonEventTeacher_name_key" ON "NeonEventTeacher"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NeonBaseRegLink_url_key" ON "NeonBaseRegLink"("url");

-- CreateIndex
CREATE UNIQUE INDEX "NeonEventType_capacity_name_price_summary_key" ON "NeonEventType"("capacity", "name", "price", "summary");

-- CreateIndex
CREATE UNIQUE INDEX "NeonEventRequester_email_key" ON "NeonEventRequester"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NeonEventTypeRequest_requestType_classTypeId_requesterId_key" ON "NeonEventTypeRequest"("requestType", "classTypeId", "requesterId");

-- CreateIndex
CREATE UNIQUE INDEX "_NeonEventCategoryToNeonEventType_AB_unique" ON "_NeonEventCategoryToNeonEventType"("A", "B");

-- CreateIndex
CREATE INDEX "_NeonEventCategoryToNeonEventType_B_index" ON "_NeonEventCategoryToNeonEventType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NeonEventTeacherToNeonEventType_AB_unique" ON "_NeonEventTeacherToNeonEventType"("A", "B");

-- CreateIndex
CREATE INDEX "_NeonEventTeacherToNeonEventType_B_index" ON "_NeonEventTeacherToNeonEventType"("B");

-- AddForeignKey
ALTER TABLE "NeonEventCategory" ADD CONSTRAINT "NeonEventCategory_archCategoriesId_fkey" FOREIGN KEY ("archCategoriesId") REFERENCES "AsmblyArchCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventInstance" ADD CONSTRAINT "NeonEventInstance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NeonEventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventInstance" ADD CONSTRAINT "NeonEventInstance_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "NeonEventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventInstance" ADD CONSTRAINT "NeonEventInstance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "NeonEventTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventInstanceRequest" ADD CONSTRAINT "NeonEventInstanceRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NeonEventInstance"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventInstanceRequest" ADD CONSTRAINT "NeonEventInstanceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "NeonEventRequester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventTypeRequest" ADD CONSTRAINT "NeonEventTypeRequest_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "NeonEventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeonEventTypeRequest" ADD CONSTRAINT "NeonEventTypeRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "NeonEventRequester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NeonEventCategoryToNeonEventType" ADD CONSTRAINT "_NeonEventCategoryToNeonEventType_A_fkey" FOREIGN KEY ("A") REFERENCES "NeonEventCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NeonEventCategoryToNeonEventType" ADD CONSTRAINT "_NeonEventCategoryToNeonEventType_B_fkey" FOREIGN KEY ("B") REFERENCES "NeonEventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NeonEventTeacherToNeonEventType" ADD CONSTRAINT "_NeonEventTeacherToNeonEventType_A_fkey" FOREIGN KEY ("A") REFERENCES "NeonEventTeacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NeonEventTeacherToNeonEventType" ADD CONSTRAINT "_NeonEventTeacherToNeonEventType_B_fkey" FOREIGN KEY ("B") REFERENCES "NeonEventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

