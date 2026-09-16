import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2/client";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, data: { configured: isR2Configured() } });
  } catch {
    return NextResponse.json({ success: false, data: { configured: false } }, { status: 401 });
  }
}
