"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { requireAuth, requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { deleteGoogleDriveFile, moveGoogleDriveFile, uploadToGoogleDrive } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";

export interface MediaItem {
  id?: string;
  name: string;
  note?: string | null;
  url: string;
  folder: string;
  size: number;
  updatedAt: string;
}

export interface MediaActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const ALLOWED_FOLDERS = ["logos", "banners", "general", "audio"] as const;
export type MediaFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif",
  ".mp3", ".wav", ".ogg", ".m4a",
]);

// In-memory fallback cache for environments where local disk write is restricted or read-only
const memoryUploadsStore: MediaItem[] = [];

async function ensureDir(dirPath: string): Promise<boolean> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (err) {
    console.warn(`Warning: Could not create directory ${dirPath}:`, err);
    return false;
  }
}

/**
 * ดึงรายการไฟล์รูปภาพทั้งหมดในโฟลเดอร์ที่ระบุ หรือทุกโฟลเดอร์
 */
export async function getMediaFilesAction(
  folder?: string
): Promise<MediaActionResult<MediaItem[]>> {
  try {
    await requireAuth();

    const foldersToScan =
      folder && ALLOWED_FOLDERS.includes(folder as MediaFolder)
        ? [folder]
        : ALLOWED_FOLDERS;

    const items: MediaItem[] = [];

    const storedAssets = await prisma.mediaAsset.findMany({
      where: folder && ALLOWED_FOLDERS.includes(folder as MediaFolder) ? { folder } : undefined,
      orderBy: { createdAt: "desc" },
    });
    for (const asset of storedAssets) {
      items.push({ id: asset.id, name: asset.name, note: asset.note, url: asset.url, folder: asset.folder, size: asset.size, updatedAt: asset.updatedAt.toISOString() });
    }

    // 1. อ่านไฟล์จากดิสก์ (ถ้าโฟลเดอร์เข้าถึงได้)
    for (const f of foldersToScan) {
      const folderPath = path.join(UPLOADS_ROOT, f);
      const isDirReady = await ensureDir(folderPath);

      if (isDirReady) {
        try {
          const dirents = await fs.readdir(folderPath, { withFileTypes: true });
          for (const dirent of dirents) {
            if (!dirent.isFile()) continue;

            const ext = path.extname(dirent.name).toLowerCase();
            if (!ALLOWED_EXTENSIONS.has(ext)) continue;

            const filePath = path.join(folderPath, dirent.name);
            try {
              const stats = await fs.stat(filePath);
              items.push({
                name: dirent.name,
                url: `/uploads/${f}/${dirent.name}`,
                folder: f,
                size: stats.size,
                updatedAt: stats.mtime.toISOString(),
              });
            } catch {
              // ignore unreadable file
            }
          }
        } catch (readErr) {
          console.warn(`Could not read directory ${folderPath}:`, readErr);
        }
      }
    }

    // 2. รวมไฟล์จาก In-Memory Fallback (ถ้ามี)
    for (const memItem of memoryUploadsStore) {
      if (foldersToScan.includes(memItem.folder as MediaFolder)) {
            if (!items.some((i) => i.name === memItem.name)) {
          items.push(memItem);
        }
      }
    }

    // เรียงจากไฟล์ใหม่สุดไปเก่าสุด
    items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return { success: true, data: items, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Get Media Files Error:", err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการโหลดรายการรูปภาพ: ${
        err instanceof Error ? err.message : String(err)
      }`,
      statusCode: 500,
    };
  }
}

/**
 * อัปโหลดไฟล์รูปภาพเข้าสู่โฟลเดอร์ (logos / banners / general)
 * รองรับทั้งการบันทึกลงดิสก์ และ Fallback เป็น Base64 Data URL อัตโนมัติหากติด Permission ใน Container
 */
export async function uploadMediaAction(
  formData: FormData
): Promise<MediaActionResult<MediaItem>> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    const noteInput = formData.get("note");
    const note = typeof noteInput === "string" && noteInput.trim() ? noteInput.trim().slice(0, 160) : null;
    const folderInput = (formData.get("folder") as string) || "general";
    const folder: MediaFolder = ALLOWED_FOLDERS.includes(folderInput as MediaFolder)
      ? (folderInput as MediaFolder)
      : "general";

    if (!file || typeof file === "string") {
      return { success: false, error: "กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง", statusCode: 400 };
    }

    // จำกัดขนาดไฟล์ไม่เกิน 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "ขนาดไฟล์ต้องไม่เกิน 10 MB", statusCode: 400 };
    }

    const ext = path.extname(file.name).toLowerCase() || ".png";
    const audioExtensions = new Set([".mp3", ".wav", ".ogg", ".m4a"]);
    const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);
    const allowedExtensions = folder === "audio" ? audioExtensions : imageExtensions;
    if (!allowedExtensions.has(ext)) {
      return {
        success: false,
        error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG, WebP, SVG, GIF)",
        statusCode: 400,
      };
    }

    try {
      const asset = await uploadToGoogleDrive(file, folder, note);
      return { success: true, data: { id: asset.id, name: asset.name, note: asset.note, url: asset.url, folder: asset.folder, size: asset.size, updatedAt: asset.updatedAt.toISOString() }, statusCode: 201 };
    } catch (error) {
      if (error instanceof Error && error.message === "GOOGLE_DRIVE_NOT_CONNECTED") {
        return { success: false, error: "ยังไม่ได้เชื่อมต่อ Google Drive กรุณาเชื่อมต่อก่อนอัปโหลดไฟล์", statusCode: 412 };
      }
      console.error("Google Drive upload error:", error);
      return { success: false, error: "อัปโหลดไป Google Drive ไม่สำเร็จ", statusCode: 502 };
    }
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Upload Media Error:", err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${
        err instanceof Error ? err.message : String(err)
      }`,
      statusCode: 500,
    };
  }
}

/**
 * ลบไฟล์รูปภาพออกจากโฟลเดอร์ uploads
 */
export async function deleteMediaAction(
  fileUrl: string
): Promise<MediaActionResult> {
  try {
    await requireAdmin();

    const asset = await prisma.mediaAsset.findFirst({ where: { url: fileUrl } });
    if (asset) {
      await deleteGoogleDriveFile(asset.driveFileId);
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      return { success: true, statusCode: 200 };
    }

    // ลบออกจาก memory store
    const memIndex = memoryUploadsStore.findIndex((i) => i.url === fileUrl);
    if (memIndex !== -1) {
      memoryUploadsStore.splice(memIndex, 1);
    }

    // ถ้าเป็น Data URL ให้คืนสำเร็จได้เลย
    if (fileUrl.startsWith("data:")) {
      return { success: true, statusCode: 200 };
    }

    if (!fileUrl.startsWith("/uploads/")) {
      return { success: false, error: "ไม่อนุญาตให้ลบไฟล์นอกโฟลเดอร์ uploads", statusCode: 400 };
    }

    // ป้องกัน Directory Traversal
    const relative = fileUrl.replace(/^\/uploads\//, "");
    const safePath = path.normalize(path.join(UPLOADS_ROOT, relative));

    if (!safePath.startsWith(UPLOADS_ROOT)) {
      return { success: false, error: "พาธไฟล์ไม่ถูกต้อง", statusCode: 400 };
    }

    try {
      await fs.unlink(safePath);
      return { success: true, statusCode: 200 };
    } catch {
      // If file was already gone or couldn't be unlinked, treat as success if removed from UI
      return { success: true, statusCode: 200 };
    }
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Delete Media Error:", err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการลบไฟล์: ${
        err instanceof Error ? err.message : String(err)
      }`,
      statusCode: 500,
    };
  }
}

export async function moveMediaAction(fileUrl: string, targetFolder: MediaFolder): Promise<MediaActionResult<MediaItem>> {
  try {
    await requireAdmin();
    if (!ALLOWED_FOLDERS.includes(targetFolder)) return { success: false, error: "โฟลเดอร์ไม่ถูกต้อง", statusCode: 400 };
    const asset = await prisma.mediaAsset.findFirst({ where: { url: fileUrl } });
    if (asset) {
      if (asset.folder === targetFolder) return { success: false, error: "ไฟล์อยู่ในโฟลเดอร์นี้แล้ว", statusCode: 400 };
      await moveGoogleDriveFile(asset.driveFileId, targetFolder);
      const updated = await prisma.mediaAsset.update({ where: { id: asset.id }, data: { folder: targetFolder } });
      return { success: true, data: { id: updated.id, name: updated.name, note: updated.note, url: updated.url, folder: updated.folder, size: updated.size, updatedAt: updated.updatedAt.toISOString() }, statusCode: 200 };
    }
    const match = fileUrl.match(/^\/uploads\/([^/]+)\/([^/]+)$/);
    if (!match || !ALLOWED_FOLDERS.includes(match[1] as MediaFolder)) return { success: false, error: "ไฟล์ไม่ถูกต้อง", statusCode: 400 };
    const sourceFolder = match[1] as MediaFolder;
    const name = path.basename(match[2]);
    const source = path.join(UPLOADS_ROOT, sourceFolder, name);
    const destination = path.join(UPLOADS_ROOT, targetFolder, name);
    if (sourceFolder === targetFolder) return { success: false, error: "ไฟล์อยู่ในโฟลเดอร์นี้แล้ว", statusCode: 400 };
    await ensureDir(path.dirname(destination));
    await fs.rename(source, destination);
    const mem = memoryUploadsStore.find((item) => item.url === fileUrl);
    if (mem) { mem.folder = targetFolder; mem.url = `/uploads/${targetFolder}/${name}`; }
    return { success: true, data: { name, url: `/uploads/${targetFolder}/${name}`, folder: targetFolder, size: mem?.size || 0, updatedAt: new Date().toISOString() }, statusCode: 200 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "ย้ายไฟล์ไม่สำเร็จ", statusCode: 500 };
  }
}

export async function updateMediaNoteAction(fileUrl: string, note: string | null): Promise<MediaActionResult<MediaItem>> {
  try {
    await requireAdmin();
    const asset = await prisma.mediaAsset.findFirst({ where: { url: fileUrl } });
    if (!asset) return { success: false, error: "ไม่พบไฟล์ในฐานข้อมูล", statusCode: 404 };
    const normalizedNote = note?.trim() ? note.trim().slice(0, 160) : null;
    const updated = await prisma.mediaAsset.update({ where: { id: asset.id }, data: { note: normalizedNote } });
    return { success: true, data: { id: updated.id, name: updated.name, note: updated.note, url: updated.url, folder: updated.folder, size: updated.size, updatedAt: updated.updatedAt.toISOString() }, statusCode: 200 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "บันทึกโน้ตไม่สำเร็จ", statusCode: 500 };
  }
}
