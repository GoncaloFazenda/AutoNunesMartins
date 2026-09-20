-- Vehicles imported as customer trade-ins enter the system as DRAFT
-- (in inventory but not yet ready to sell — the dealer hasn't decided the
-- sale price yet). The publish flow flips them to AVAILABLE once priced.
ALTER TYPE "VehicleStatus" ADD VALUE 'DRAFT';
