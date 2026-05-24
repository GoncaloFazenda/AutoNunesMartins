-- Add an optional manual commission to Sale records.
-- Default 0 keeps existing rows mathematically unchanged: the formula
--   realProfit = (margin - vatAmount) + commission
-- collapses back to the previous (margin - vatAmount) when commission = 0.
ALTER TABLE "Sale" ADD COLUMN "commission" DECIMAL(12, 2) NOT NULL DEFAULT 0;
