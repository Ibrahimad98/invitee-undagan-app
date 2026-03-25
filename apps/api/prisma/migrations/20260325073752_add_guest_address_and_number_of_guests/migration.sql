-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "address" TEXT,
ADD COLUMN     "number_of_guests" INTEGER NOT NULL DEFAULT 1;
