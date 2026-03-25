-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'contact',
    "item" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
