ALTER TABLE "MediaAsset" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MediaAsset" ADD COLUMN "playCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MediaAsset" ADD COLUMN "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "MediaAsset" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Spot" ADD COLUMN "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Spot" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "TrackRating" (
  "id" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrackRating_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SpotRating" (
  "id" TEXT NOT NULL,
  "spotId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SpotRating_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SpotFavorite" (
  "id" TEXT NOT NULL,
  "spotId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SpotFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrackRating_assetId_userId_key" ON "TrackRating"("assetId", "userId");
CREATE UNIQUE INDEX "SpotRating_spotId_userId_key" ON "SpotRating"("spotId", "userId");
CREATE UNIQUE INDEX "SpotFavorite_spotId_userId_key" ON "SpotFavorite"("spotId", "userId");
CREATE INDEX "TrackRating_assetId_idx" ON "TrackRating"("assetId");
CREATE INDEX "SpotRating_spotId_idx" ON "SpotRating"("spotId");
CREATE INDEX "SpotFavorite_spotId_idx" ON "SpotFavorite"("spotId");
ALTER TABLE "TrackRating" ADD CONSTRAINT "TrackRating_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackRating" ADD CONSTRAINT "TrackRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotFavorite" ADD CONSTRAINT "SpotFavorite_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotFavorite" ADD CONSTRAINT "SpotFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
