import crypto from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createR2PresignedPut, getR2PublicUrl } from "@/lib/r2/upload";
import { isR2Configured } from "@/lib/r2/client";

export const dynamic = "force-dynamic";

// รับไฟล์ต้นฉบับได้ถึง 50MB; รูปและเสียงจะถูกลดขนาดฝั่ง browser ก่อนส่งจริงเมื่อทำได้
const MAX_SIZE = 50 * 1024 * 1024;
const FOLDERS = new Set(["logos", "favicons", "banners", "general", "audio", "relaxation"]);
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp3", ".wav", ".ogg", ".m4a", ".webm"]);

function signUpload(userId: string, key: string, originalName: string, mimeType: string, size: number) {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET || "development-only";
  return crypto.createHmac("sha256", secret).update([userId, key, originalName, mimeType, size].join("\n")).digest("base64url");
}

export function verifyUploadSignature(userId: string, key: string, originalName: string, mimeType: string, size: number, signature: string) {
  const expected = signUpload(userId, key, originalName, mimeType, size);
  const actual = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, actual);
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!isR2Configured()) return NextResponse.json({ success: false, error: "ยังไม่ได้ตั้งค่า Cloudflare R2 บนเซิร์ฟเวอร์" }, { status: 503 });
    const body = await request.json() as { fileName?: string; contentType?: string; size?: number; folder?: string };
    const fileName = typeof body.fileName === "string" ? path.basename(body.fileName) : "";
    const contentType = typeof body.contentType === "string" ? body.contentType : "application/octet-stream";
    const size = Number(body.size || 0);
    const folder = typeof body.folder === "string" ? body.folder : "general";
    const extension = path.extname(fileName).toLowerCase();
    if (!fileName || !FOLDERS.has(folder) || !EXTENSIONS.has(extension) || size <= 0 || size > MAX_SIZE) return NextResponse.json({ success: false, error: "ไฟล์ไม่ถูกต้องหรือมีขนาดเกิน 50 MB" }, { status: 400 });
    if ((folder === "audio" || folder === "relaxation") !== contentType.startsWith("audio/")) return NextResponse.json({ success: false, error: "ชนิดไฟล์ไม่ตรงกับคลังที่เลือก" }, { status: 400 });
    const safeExtension = contentType === "image/webp" ? ".webp" : contentType === "audio/webm" ? ".webm" : extension;
    const key = `users/${session.userId}/${folder}/${crypto.randomUUID()}${safeExtension}`;
    const uploadUrl = await createR2PresignedPut(key, contentType);
    const uploadToken = signUpload(session.userId, key, fileName, contentType, size);
    return NextResponse.json({ success: true, data: { uploadUrl, fileKey: key, publicUrl: getR2PublicUrl(key), uploadToken } });
  } catch (error) {
    console.error("R2 presign error:", error);
    return NextResponse.json({ success: false, error: "สร้างสิทธิ์อัปโหลด Cloudflare R2 ไม่สำเร็จ" }, { status: 500 });
  }
}
