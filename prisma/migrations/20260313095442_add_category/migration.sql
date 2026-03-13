-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_domainId_idx" ON "category"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "category_domainId_name_key" ON "category"("domainId", "name");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create a "General" category for every domain that has requirements
INSERT INTO "category" ("id", "name", "domainId", "updatedAt")
SELECT gen_random_uuid(), 'General', d."id", NOW()
FROM "domain" d
WHERE EXISTS (SELECT 1 FROM "requirement" r WHERE r."domainId" = d."id");

-- AlterTable: add categoryId as nullable first
ALTER TABLE "requirement" ADD COLUMN "categoryId" TEXT;

-- Backfill: assign existing requirements to their domain's "General" category
UPDATE "requirement" r
SET "categoryId" = c."id"
FROM "category" c
WHERE c."domainId" = r."domainId" AND c."name" = 'General';

-- Now make it required
ALTER TABLE "requirement" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "requirement_categoryId_idx" ON "requirement"("categoryId");

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
