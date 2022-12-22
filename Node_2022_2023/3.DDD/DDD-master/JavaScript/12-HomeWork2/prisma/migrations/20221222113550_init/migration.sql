/*
  Warnings:

  - You are about to drop the column `roleName` on the `Account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Account_roleName_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "roleName";
