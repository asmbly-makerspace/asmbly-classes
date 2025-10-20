/*
  Warnings:

  - You are about to drop the column `active_expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `idle_expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `Key` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created_at` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secret_hash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_user_id_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "active_expires",
DROP COLUMN "idle_expires",
ADD COLUMN     "created_at" INTEGER NOT NULL,
ADD COLUMN     "secret_hash" BYTEA NOT NULL;

-- DropTable
DROP TABLE "Key";
