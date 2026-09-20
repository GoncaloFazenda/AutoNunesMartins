-- Distinguish private buyers from dealer/reseller buyers on each Sale.
-- PARTICULAR (default) keeps existing rows on the 23/123 margin VAT scheme.
-- COMERCIANTE marks a B2B sale where no VAT is withheld by the dealer
-- (the full margin becomes the real profit). Backfilled to PARTICULAR so
-- previously-recorded sales keep their original numbers.
CREATE TYPE "BuyerType" AS ENUM ('PARTICULAR', 'COMERCIANTE');

ALTER TABLE "Sale" ADD COLUMN "buyerType" "BuyerType" NOT NULL DEFAULT 'PARTICULAR';
