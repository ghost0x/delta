-- Add status column to revision
ALTER TABLE "revision" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'unverified';

-- Set published/deprecated status for revisions in published releases
UPDATE "revision" SET "status" = 'deprecated'
  WHERE "releaseId" IN (SELECT "id" FROM "release" WHERE "status" = 'published')
  AND "type" = 'deprecation';

UPDATE "revision" SET "status" = 'published'
  WHERE "releaseId" IN (SELECT "id" FROM "release" WHERE "status" = 'published')
  AND "type" != 'deprecation';

-- Remove status column from requirement
ALTER TABLE "requirement" DROP COLUMN "status";
