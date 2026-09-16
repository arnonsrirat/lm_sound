ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "originalName" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "fileKey" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "storageProvider" TEXT NOT NULL DEFAULT 'google-drive';
ALTER TABLE "MediaAsset" ALTER COLUMN "driveFileId" DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_fileKey_key" ON "MediaAsset"("fileKey");
