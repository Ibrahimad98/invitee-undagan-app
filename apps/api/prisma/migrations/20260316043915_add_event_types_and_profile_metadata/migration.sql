-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'GRADUATION';
ALTER TYPE "EventType" ADD VALUE 'REUNION';
ALTER TYPE "EventType" ADD VALUE 'CORPORATE';
ALTER TYPE "EventType" ADD VALUE 'SYUKURAN';
ALTER TYPE "EventType" ADD VALUE 'ANNIVERSARY';
ALTER TYPE "EventType" ADD VALUE 'WALIMAH';

-- AlterTable
ALTER TABLE "person_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "date_of_birth" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "supported_event_types" TEXT[] DEFAULT ARRAY[]::TEXT[];
