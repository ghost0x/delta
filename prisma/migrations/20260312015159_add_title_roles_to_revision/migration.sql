-- AlterTable: Add title as nullable first
ALTER TABLE "revision" ADD COLUMN "title" TEXT;

-- Backfill title from parent requirement
UPDATE "revision" r SET "title" = req."title"
FROM "requirement" req WHERE r."requirementId" = req."id";

-- Set NOT NULL after backfill
ALTER TABLE "revision" ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "revision_role" (
    "revisionId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "revision_role_pkey" PRIMARY KEY ("revisionId","roleId")
);

-- Backfill revision_role from requirement_role for each existing revision
INSERT INTO "revision_role" ("revisionId", "roleId")
SELECT r."id", rr."roleId"
FROM "revision" r
JOIN "requirement_role" rr ON rr."requirementId" = r."requirementId";

-- AddForeignKey
ALTER TABLE "revision_role" ADD CONSTRAINT "revision_role_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_role" ADD CONSTRAINT "revision_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "business_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
