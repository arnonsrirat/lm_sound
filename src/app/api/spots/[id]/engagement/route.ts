import { NextRequest, NextResponse } from "next/server";
import { rateSpot, toggleSpotFavorite } from "@/actions/engagement";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json() as { action?: string; score?: number };
  try {
    const result = body.action === "favorite" ? await toggleSpotFavorite(id) : await rateSpot(id, body.score);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 }); }
}
