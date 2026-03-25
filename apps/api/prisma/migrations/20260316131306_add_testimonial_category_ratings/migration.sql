-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rating_desain" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "rating_kemudahan" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "rating_layanan" INTEGER NOT NULL DEFAULT 5;
