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

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // directory already exists or error handled
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
    await ensureDir(UPLOADS_ROOT);

    const foldersToScan = folder && ALLOWED_FOLDERS.includes(folder as MediaFolder)
      ? [folder]
      : ALLOWED_FOLDERS;

    const items: MediaItem[] = [];

    for (const f of foldersToScan) {
      const folderPath = path.join(UPLOADS_ROOT, f);
      await ensureDir(folderPath);

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
    }

    // เรียงจากไฟล์ใหม่สุดไปเก่าสุด
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return { success: true, data: items, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Get Media Files Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดรายการรูปภาพ", statusCode: 500 };
  }
}

/**
 * อัปโหลดไฟล์รูปภาพเข้าสู่โฟลเดอร์ (logos / banners / general)
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
      return { success: false, error: "กรุณาเลือกไฟล์รูปภาพ", statusCode: 400 };
    }

    // จำกัดขนาดไฟล์ไม่เกิน 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "ขนาดไฟล์ต้องไม่เกิน 10 MB", statusCode: 400 };
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        success: false,
        error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG, WebP, SVG, GIF)",
        statusCode: 400,
      };
    }

    const folderPath = path.join(UPLOADS_ROOT, folder);
    await ensureDir(folderPath);

    // กำหนดชื่อไฟล์ ป้องกันชื่อซ้ำและ sanitize อักขระพิเศษ
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fileName = `${baseName}_${uniqueSuffix}${ext}`;
    const filePath = path.join(folderPath, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);
    const mediaItem: MediaItem = {
      name: fileName,
      url: `/uploads/${folder}/${fileName}`,
      folder,
      size: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };

    return { success: true, data: mediaItem, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Upload Media Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์", statusCode: 500 };
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
      return { success: false, error: "ไม่พบไฟล์ที่ต้องการลบ", statusCode: 404 };
    }
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Delete Media Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบไฟล์", statusCode: 500 };
  }
}
