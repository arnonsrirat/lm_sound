CREATE TABLE "SpotNoiseSample" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "note" TEXT,
    "noiseScore" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SpotNoiseSample_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpotNoiseSample_spotId_timeSlot_key" ON "SpotNoiseSample"("spotId", "timeSlot");
CREATE INDEX "SpotNoiseSample_spotId_recordedAt_idx" ON "SpotNoiseSample"("spotId", "recordedAt");
CREATE INDEX "SpotNoiseSample_mediaAssetId_idx" ON "SpotNoiseSample"("mediaAssetId");
ALTER TABLE "SpotNoiseSample" ADD CONSTRAINT "SpotNoiseSample_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotNoiseSample" ADD CONSTRAINT "SpotNoiseSample_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
