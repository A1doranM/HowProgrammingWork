/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `areaName` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[areaId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `areaId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_areaName_fkey";

-- DropIndex
DROP INDEX "Area_ownerId_key";

-- DropIndex
DROP INDEX "Message_areaName_key";

-- AlterTable
ALTER TABLE "Area" DROP COLUMN "ownerId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Area_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "areaName",
ADD COLUMN     "areaId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "AreaAccount" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "AreaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_areaId_key" ON "Message"("areaId");

-- AddForeignKey
ALTER TABLE "AreaAccount" ADD CONSTRAINT "AreaAccount_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAccount" ADD CONSTRAINT "AreaAccount_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
