-- CreateTable
CREATE TABLE "NeonEventInstanceCancellee" (
    "neonId" INTEGER NOT NULL,

    CONSTRAINT "NeonEventInstanceCancellee_pkey" PRIMARY KEY ("neonId")
);

-- CreateTable
CREATE TABLE "_NeonEventInstanceToNeonEventInstanceCancellee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_NeonEventInstanceToNeonEventInstanceCancellee_AB_unique" ON "_NeonEventInstanceToNeonEventInstanceCancellee"("A", "B");

-- CreateIndex
CREATE INDEX "_NeonEventInstanceToNeonEventInstanceCancellee_B_index" ON "_NeonEventInstanceToNeonEventInstanceCancellee"("B");

-- AddForeignKey
ALTER TABLE "_NeonEventInstanceToNeonEventInstanceCancellee" ADD CONSTRAINT "_NeonEventInstanceToNeonEventInstanceCancellee_A_fkey" FOREIGN KEY ("A") REFERENCES "NeonEventInstance"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NeonEventInstanceToNeonEventInstanceCancellee" ADD CONSTRAINT "_NeonEventInstanceToNeonEventInstanceCancellee_B_fkey" FOREIGN KEY ("B") REFERENCES "NeonEventInstanceCancellee"("neonId") ON DELETE CASCADE ON UPDATE CASCADE;
