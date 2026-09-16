import { NextRequest, NextResponse } from "next/server";
import { getMediaFilesAction, uploadMediaAction, deleteMediaAction, updateMediaNoteAction } from "@/actions/media";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || undefined;
  const result = await getMediaFilesAction(folder);

  return NextResponse.json(result, { status: result.statusCode || (result.success ? 200 : 500) });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadMediaAction(formData);

    return NextResponse.json(result, { status: result.statusCode || (result.success ? 201 : 400) });
  } catch (err) {
    console.error("API Upload Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: `เกิดข้อผิดพลาดในการรับไฟล์อัปโหลด: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("fileUrl");

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ fileUrl ที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const result = await deleteMediaAction(fileUrl);
    return NextResponse.json(result, { status: result.statusCode || (result.success ? 200 : 400) });
  } catch (err) {
    console.error("API Delete Error:", err);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการลบไฟล์" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { fileUrl?: string; note?: string | null; timeTag?: string | null; isPublished?: boolean };
    if (!body.fileUrl) return NextResponse.json({ success: false, error: "กรุณาระบุไฟล์ที่ต้องการแก้ไข" }, { status: 400 });
    const result = await updateMediaNoteAction(body.fileUrl, body.note ?? null, body.timeTag ?? null, body.isPublished);
    return NextResponse.json(result, { status: result.statusCode || (result.success ? 200 : 400) });
  } catch {
    return NextResponse.json({ success: false, error: "บันทึกโน้ตไม่สำเร็จ" }, { status: 500 });
  }
}
