CREATE TABLE IF NOT EXISTS "GoogleDriveConnection" (
  "id" TEXT NOT NULL,
  "accountEmail" TEXT,
  "refreshTokenEncrypted" TEXT NOT NULL,
  "rootFolderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GoogleDriveConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MediaAsset" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "folder" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "driveFileId" TEXT NOT NULL,
  "driveWebViewUrl" TEXT,
  "url" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_driveFileId_key" ON "MediaAsset"("driveFileId");
CREATE INDEX IF NOT EXISTS "MediaAsset_folder_createdAt_idx" ON "MediaAsset"("folder", "createdAt");
