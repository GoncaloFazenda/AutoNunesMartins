-- Additive only. Existing vehicles remain private, with no approved content.
CREATE TYPE "PublicTransmission" AS ENUM ('MANUAL', 'AUTOMATIC');

ALTER TABLE "Vehicle"
  ADD COLUMN "webPublished" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicSlug" TEXT,
  ADD COLUMN "publicPrice" DECIMAL(12,2),
  ADD COLUMN "publicDescription" TEXT,
  ADD COLUMN "publicPhotoPaths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "publicTransmission" "PublicTransmission";

CREATE UNIQUE INDEX "Vehicle_publicSlug_key" ON "Vehicle"("publicSlug");
CREATE INDEX "Vehicle_webPublished_status_idx" ON "Vehicle"("webPublished", "status");

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_public_price_positive"
  CHECK ("publicPrice" IS NULL OR "publicPrice" > 0);
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_web_publication_complete"
  CHECK (NOT "webPublished" OR ("publicSlug" IS NOT NULL AND "publicPrice" IS NOT NULL));
