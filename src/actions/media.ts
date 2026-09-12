"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth";

export interface MediaItem {
  name: string;
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
const ALLOWED_FOLDERS = ["logos", "banners", "general"] as const;
export type MediaFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

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
    await requireAdmin();

    const foldersToScan =
      folder && ALLOWED_FOLDERS.includes(folder as MediaFolder)
        ? [folder]
        : ALLOWED_FOLDERS;

    const items: MediaItem[] = [];

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
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        success: false,
        error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG, WebP, SVG, GIF)",
        statusCode: 400,
      };
    }

    const folderPath = path.join(UPLOADS_ROOT, folder);
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 35);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fileName = `${baseName || "img"}_${uniqueSuffix}${ext}`;
    const filePath = path.join(folderPath, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    let finalUrl = `/uploads/${folder}/${fileName}`;
    let writeSuccess = false;

    // พยายามบันทึกลงดิสก์
    try {
      const dirOk = await ensureDir(folderPath);
      if (dirOk) {
        await fs.writeFile(filePath, buffer);
        writeSuccess = true;
      }
    } catch (diskErr) {
      console.warn(
        `Disk write failed for ${filePath} (likely permission/readonly container):`,
        diskErr
      );
    }

    // ถ้าบันทึกลงดิสก์ไม่สำเร็จ (เช่น ติด Permission Denied EACCES หรือ Read-only filesystem ใน Docker)
    // ให้ Fallback แปลงเป็น Data URL เพื่อให้แอดมินใช้งานได้ทันทีโดยเว็บไม่พัง
    if (!writeSuccess) {
      const mimeType = file.type || "image/png";
      finalUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    const mediaItem: MediaItem = {
      name: fileName,
      url: finalUrl,
      folder,
      size: file.size,
      updatedAt: new Date().toISOString(),
    };

    memoryUploadsStore.unshift(mediaItem);

    return { success: true, data: mediaItem, statusCode: 200 };
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
