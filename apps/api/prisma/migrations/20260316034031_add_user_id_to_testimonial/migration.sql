-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "testimonials_user_id_idx" ON "testimonials"("user_id");
