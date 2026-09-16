import { NextResponse } from "next/server";
import { getGoogleDriveFile, getGoogleDriveThumbnail } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const variant = new URL(request.url).searchParams.get("variant");
    if (variant === "thumb") {
      const thumbnail = await getGoogleDriveThumbnail(fileId);
      if (thumbnail) {
        return new NextResponse(thumbnail.body, {
          headers: {
            "Content-Type": thumbnail.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }
    const response = await getGoogleDriveFile(fileId);
    return new NextResponse(response.body, { headers: { "Content-Type": response.headers.get("content-type") || "application/octet-stream", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
