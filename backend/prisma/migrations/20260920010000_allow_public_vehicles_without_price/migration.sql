-- Explicit product policy: unknown price is NULL, never zero. Photos are optional.
-- Preserve the positive-price check for any non-null public price.
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_web_publication_complete";
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_web_publication_complete"
  CHECK (NOT "webPublished" OR "publicSlug" IS NOT NULL);
