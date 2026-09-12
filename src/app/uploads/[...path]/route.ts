import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const subPaths = resolvedParams.path || [];

    if (!subPaths.length) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const relativePath = path.join(...subPaths);
    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    const fullPath = path.normalize(path.join(uploadsRoot, relativePath));

    // Prevent directory traversal
    if (!fullPath.startsWith(uploadsRoot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    try {
      const fileBuffer = await fs.readFile(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new NextResponse("File Not Found", { status: 404 });
    }
  } catch (err) {
    console.error("Uploads Serve Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
