/*
  Warnings:

  - A unique constraint covering the columns `[user_id,template_id]` on the table `testimonials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GuestLimitRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PREMIUM_REQUEST', 'GUEST_LIMIT_REQUEST', 'TESTIMONIAL_NEW', 'BUG_FEEDBACK_NEW', 'REQUEST_APPROVED', 'REQUEST_REJECTED');

-- CreateEnum
CREATE TYPE "BugFeedbackStatus" AS ENUM ('UNHANDLED', 'HANDLED');

-- AlterEnum
ALTER TYPE "SubscriptionType" ADD VALUE 'FAST_SERVE';

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "template_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verify_expires" TIMESTAMP(3),
ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_first_login" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_whatsapp_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_guests" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "whatsapp_otp" TEXT,
ADD COLUMN     "whatsapp_otp_expires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "guest_limit_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invitation_id" TEXT,
    "current_limit" INTEGER NOT NULL,
    "requested_amount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "GuestLimitRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_limit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_feedbacks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'bug',
    "status" "BugFeedbackStatus" NOT NULL DEFAULT 'UNHANDLED',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_limit_requests_user_id_idx" ON "guest_limit_requests"("user_id");

-- CreateIndex
CREATE INDEX "guest_limit_requests_status_idx" ON "guest_limit_requests"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "bug_feedbacks_user_id_idx" ON "bug_feedbacks"("user_id");

-- CreateIndex
CREATE INDEX "bug_feedbacks_status_idx" ON "bug_feedbacks"("status");

-- CreateIndex
CREATE INDEX "testimonials_template_id_idx" ON "testimonials"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_user_id_template_id_key" ON "testimonials"("user_id", "template_id");

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_limit_requests" ADD CONSTRAINT "guest_limit_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_feedbacks" ADD CONSTRAINT "bug_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
