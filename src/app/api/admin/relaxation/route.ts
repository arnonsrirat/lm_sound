import { NextRequest, NextResponse } from "next/server";
import { deleteRelaxationPlaylist, getAdminRelaxationData, saveRelaxationPlaylist } from "@/actions/engagement";

export async function GET() {
  try { return NextResponse.json({ success: true, data: await getAdminRelaxationData() }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ" }, { status: 403 }); }
}

export async function POST(request: NextRequest) {
  try { return NextResponse.json({ success: true, data: await saveRelaxationPlaylist(await request.json()) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "บันทึกเพลย์ลิสต์ไม่สำเร็จ" }, { status: 400 }); }
}

export async function DELETE(request: NextRequest) {
  try { const { id } = await request.json() as { id?: string }; if (!id) return NextResponse.json({ success: false, error: "ไม่พบเพลย์ลิสต์" }, { status: 400 }); return NextResponse.json(await deleteRelaxationPlaylist(id)); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "ลบเพลย์ลิสต์ไม่สำเร็จ" }, { status: 400 }); }
}
