import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spotSchema } from "@/lib/validations/spot";
import { requireAuth, assertSpotOwnership, ForbiddenError, UnauthorizedError } from "@/lib/auth";

// GET /api/spots/[id] - ดึงข้อมูลจุดอ่านหนังสือเฉพาะรายการ
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spot = await prisma.spot.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    if (!spot) {
      return NextResponse.json({ success: false, error: "ไม่พบจุดอ่านหนังสือนี้" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: spot });
  } catch (error) {
    console.error("GET /api/spots/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

// PUT /api/spots/[id] - แก้ไขจุดอ่านหนังสือ (เฉพาะเจ้าของเท่านั้น: 403 Forbidden)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    const existingSpot = await prisma.spot.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingSpot) {
      return NextResponse.json({ success: false, error: "ไม่พบจุดอ่านหนังสือนี้" }, { status: 404 });
    }

    // Authorization Guard: 403 Forbidden
    assertSpotOwnership(existingSpot.authorId, session.userId);

    const body = await request.json();
    const validated = spotSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ข้อมูลไม่ถูกต้อง",
          fieldErrors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.spot.update({
      where: { id },
      data: validated.data,
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    console.error("PUT /api/spots/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}

// DELETE /api/spots/[id] - ลบจุดอ่านหนังสือ (เฉพาะเจ้าของเท่านั้น: 403 Forbidden)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    const existingSpot = await prisma.spot.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingSpot) {
      return NextResponse.json({ success: false, error: "ไม่พบจุดอ่านหนังสือนี้" }, { status: 404 });
    }

    // Authorization Guard: 403 Forbidden
    assertSpotOwnership(existingSpot.authorId, session.userId);

    await prisma.spot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "ลบจุดอ่านหนังสือเรียบร้อยแล้ว" });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/spots/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}
