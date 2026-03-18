-- CreateTable
CREATE TABLE "invitation_comments" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitation_comments_invitation_id_idx" ON "invitation_comments"("invitation_id");

-- AddForeignKey
ALTER TABLE "invitation_comments" ADD CONSTRAINT "invitation_comments_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
