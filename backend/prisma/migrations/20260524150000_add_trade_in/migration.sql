-- Trade-ins: a car the customer hands over as partial payment for the vehicle
-- they are buying. Always tied to exactly one Sale (1:1). When `disposition`
-- is STOCK, a new Vehicle row is created at sale time and linked via
-- `resultingVehicleId`. SCRAP records the deal without inventory entry
-- (car goes to scrap / dismantler / B2B auction).
CREATE TYPE "TradeInDisposition" AS ENUM ('STOCK', 'SCRAP');

-- New activity type emitted when a trade-in is received as part of a sale,
-- so the timeline / notifications can distinguish it from a plain SALE_CREATED.
ALTER TYPE "ActivityType" ADD VALUE 'TRADE_IN_RECEIVED';

CREATE TABLE "TradeIn" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "mileage" INTEGER NOT NULL,
    "licensePlate" TEXT,
    "vin" TEXT,
    "allowanceValue" DECIMAL(12,2) NOT NULL,
    "disposition" "TradeInDisposition" NOT NULL,
    "resultingVehicleId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeIn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TradeIn_saleId_key" ON "TradeIn"("saleId");
CREATE UNIQUE INDEX "TradeIn_resultingVehicleId_key" ON "TradeIn"("resultingVehicleId");

ALTER TABLE "TradeIn"
    ADD CONSTRAINT "TradeIn_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TradeIn"
    ADD CONSTRAINT "TradeIn_resultingVehicleId_fkey"
    FOREIGN KEY ("resultingVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
