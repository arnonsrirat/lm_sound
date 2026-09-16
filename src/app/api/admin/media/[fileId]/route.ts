import { NextResponse } from "next/server";
import { getGoogleDriveFile } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const response = await getGoogleDriveFile(fileId);
    return new NextResponse(response.body, { headers: { "Content-Type": response.headers.get("content-type") || "application/octet-stream", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
