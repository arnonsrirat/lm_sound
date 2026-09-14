import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { disconnectGoogleDrive, getGoogleDriveStatus } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, data: await getGoogleDriveStatus() });
  } catch {
    return NextResponse.json({ success: false, error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    await disconnectGoogleDrive();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "ตัดการเชื่อมต่อไม่สำเร็จ" }, { status: 400 });
  }
}
