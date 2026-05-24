-- Add the Portuguese license plate ("matrícula") to Vehicle.
-- Nullable so historical rows without a recorded plate are still valid;
-- unique when set so the dealership can rely on it as a stable lookup key.
ALTER TABLE "Vehicle" ADD COLUMN "licensePlate" TEXT;
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");
