-- Preserve existing spots while enabling map pin coordinates.
ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
