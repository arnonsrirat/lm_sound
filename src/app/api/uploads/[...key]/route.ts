import { NextResponse } from "next/server";
import { getR2Object } from "@/lib/r2/upload";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key } = await params;
    const object = await getR2Object(key.join("/"));
    return new NextResponse(object.Body as BodyInit, { headers: { "Content-Type": object.ContentType || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", ...(object.ContentLength ? { "Content-Length": String(object.ContentLength) } : {}) } });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
