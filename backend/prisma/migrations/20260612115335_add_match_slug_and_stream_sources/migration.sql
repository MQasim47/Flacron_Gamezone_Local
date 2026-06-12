/*
  Warnings:

  - A unique constraint covering the columns `[apiMatchSlug]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "apiMatchSlug" TEXT;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "streamSources" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Match_apiMatchSlug_key" ON "Match"("apiMatchSlug");
