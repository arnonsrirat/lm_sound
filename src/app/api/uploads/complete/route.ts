import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headR2Object, getR2PublicUrl } from "@/lib/r2/upload";
import { verifyUploadSignature } from "@/app/api/uploads/presign/route";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json() as { fileKey?: string; originalName?: string; contentType?: string; size?: number; folder?: string; note?: string; timeTag?: string; uploadToken?: string };
    const fileKey = body.fileKey || "";
    const originalName = body.originalName || "";
    const contentType = body.contentType || "application/octet-stream";
    const size = Number(body.size || 0);
    if (!fileKey.startsWith(`users/${session.userId}/`) || !body.uploadToken || !verifyUploadSignature(session.userId, fileKey, originalName, contentType, size, body.uploadToken)) return NextResponse.json({ success: false, error: "ข้อมูลยืนยันไฟล์ไม่ถูกต้อง" }, { status: 400 });
    const object = await headR2Object(fileKey);
    if (Number(object.ContentLength || 0) !== size || object.ContentType !== contentType) return NextResponse.json({ success: false, error: "ไฟล์บน R2 ไม่ตรงกับข้อมูลที่ขออัปโหลด" }, { status: 409 });
    // ใช้โฟลเดอร์จาก key ที่เซิร์ฟเวอร์สร้างเท่านั้น ไม่รับ path จาก client
    const folder = fileKey.split("/")[2] || "";
    if (!["logos", "banners", "general", "audio", "relaxation"].includes(folder)) {
      return NextResponse.json({ success: false, error: "โฟลเดอร์ไฟล์ไม่ถูกต้อง" }, { status: 400 });
    }
    const asset = await prisma.mediaAsset.create({ data: { name: fileKey.split("/").pop() || originalName, originalName, fileKey, storageProvider: "r2", note: body.note?.trim().slice(0, 160) || null, timeTag: body.timeTag?.trim().slice(0, 40) || null, folder, mimeType: contentType, size, driveFileId: null, driveWebViewUrl: null, url: getR2PublicUrl(fileKey) } });
    return NextResponse.json({ success: true, data: { id: asset.id, name: asset.name, note: asset.note, timeTag: asset.timeTag, isPublished: asset.isPublished, playCount: asset.playCount, averageRating: asset.averageRating, ratingCount: asset.ratingCount, url: asset.url, folder: asset.folder, size: asset.size, updatedAt: asset.updatedAt.toISOString() } }, { status: 201 });
  } catch (error) {
    console.error("R2 complete upload error:", error);
    return NextResponse.json({ success: false, error: "ยืนยันไฟล์บน Cloudflare R2 ไม่สำเร็จ" }, { status: 500 });
  }
}
