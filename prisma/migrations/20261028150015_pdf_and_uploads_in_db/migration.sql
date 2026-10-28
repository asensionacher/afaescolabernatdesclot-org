/*
  Warnings:

  - You are about to drop the column `pdfPath` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `storedName` on the `Upload` table. All the data in the column will be lost.
  - Added the required column `data` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Upload_storedName_key";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "pdfPath",
ADD COLUMN     "pdfData" BYTEA,
ADD COLUMN     "pdfFilename" TEXT;

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "storedName",
ADD COLUMN     "data" BYTEA NOT NULL;
