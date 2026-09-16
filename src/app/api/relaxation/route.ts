import { NextRequest, NextResponse } from "next/server";
import { getPublishedRelaxationTracks, rateTrack, recordTrackPlay } from "@/actions/engagement";

export async function GET() { return NextResponse.json({ success: true, data: await getPublishedRelaxationTracks() }); }
export async function POST(request: NextRequest) {
  const body = await request.json() as { action?: string; assetId?: string; score?: number };
  if (!body.assetId) return NextResponse.json({ success: false, error: "กรุณาระบุเพลง" }, { status: 400 });
  try {
    const result = body.action === "play" ? await recordTrackPlay(body.assetId) : await rateTrack(body.assetId, body.score);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 }); }
}
