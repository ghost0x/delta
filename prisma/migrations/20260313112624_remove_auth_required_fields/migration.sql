-- DropForeignKey
ALTER TABLE "release" DROP CONSTRAINT "release_createdById_fkey";

-- DropForeignKey
ALTER TABLE "requirement" DROP CONSTRAINT "requirement_createdById_fkey";

-- DropForeignKey
ALTER TABLE "revision" DROP CONSTRAINT "revision_createdById_fkey";

-- AlterTable
ALTER TABLE "release" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "requirement" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "revision" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
