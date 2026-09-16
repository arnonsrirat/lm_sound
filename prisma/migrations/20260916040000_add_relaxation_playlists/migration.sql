CREATE TABLE IF NOT EXISTS "RelaxationPlaylist" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "coverUrl" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RelaxationPlaylist_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "RelaxationPlaylistTrack" (
  "id" TEXT NOT NULL,
  "playlistId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "RelaxationPlaylistTrack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RelaxationPlaylistTrack_playlistId_assetId_key" ON "RelaxationPlaylistTrack"("playlistId", "assetId");
CREATE INDEX IF NOT EXISTS "RelaxationPlaylist_isPublished_updatedAt_idx" ON "RelaxationPlaylist"("isPublished", "updatedAt");
CREATE INDEX IF NOT EXISTS "RelaxationPlaylistTrack_playlistId_position_idx" ON "RelaxationPlaylistTrack"("playlistId", "position");
DO $$ BEGIN
  ALTER TABLE "RelaxationPlaylistTrack" ADD CONSTRAINT "RelaxationPlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "RelaxationPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RelaxationPlaylistTrack" ADD CONSTRAINT "RelaxationPlaylistTrack_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
