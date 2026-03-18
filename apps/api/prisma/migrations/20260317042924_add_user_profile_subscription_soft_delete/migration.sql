-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscription_expire_date" TIMESTAMP(3),
ADD COLUMN     "subscription_type" "SubscriptionType" NOT NULL DEFAULT 'BASIC';
