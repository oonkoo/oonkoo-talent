-- AlterTable: add slug column with temporary default
ALTER TABLE "companies" ADD COLUMN "slug" TEXT;

-- Backfill existing rows: generate slug from name (lowercase, spaces to hyphens)
UPDATE "companies" SET "slug" = LOWER(REPLACE(TRIM("name"), ' ', '-'));

-- Now make it NOT NULL
ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
