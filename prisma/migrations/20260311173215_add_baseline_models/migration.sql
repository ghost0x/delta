-- CreateTable
CREATE TABLE "domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_role" (
    "requirementId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "requirement_role_pkey" PRIMARY KEY ("requirementId","roleId")
);

-- CreateTable
CREATE TABLE "revision" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "releaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "release_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_name_key" ON "domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "business_role_name_key" ON "business_role"("name");

-- CreateIndex
CREATE INDEX "requirement_domainId_idx" ON "requirement"("domainId");

-- CreateIndex
CREATE INDEX "revision_requirementId_idx" ON "revision"("requirementId");

-- CreateIndex
CREATE INDEX "revision_releaseId_idx" ON "revision"("releaseId");

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_role" ADD CONSTRAINT "requirement_role_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_role" ADD CONSTRAINT "requirement_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "business_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
