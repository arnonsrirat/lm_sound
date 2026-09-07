import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spotSchema } from "@/lib/validations/spot";
import { requireAuth, UnauthorizedError } from "@/lib/auth";

// GET /api/spots - รายการจุดอ่านหนังสือ (Feed) พร้อม Search และ Filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const noiseLevel = searchParams.get("noiseLevel") || undefined;

    const whereClause: Record<string, unknown> = {};

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (noiseLevel && noiseLevel !== "all") {
      whereClause.noiseLevel = noiseLevel;
    }

    const spots = await prisma.spot.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: spots });
  } catch (error) {
    console.error("GET /api/spots error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลจุดอ่านหนังสือ" },
      { status: 500 }
    );
  }
}

// POST /api/spots - เพิ่มจุดอ่านหนังสือใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
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

    const spot = await prisma.spot.create({
      data: {
        ...validated.data,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: spot }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    console.error("POST /api/spots error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสร้างจุดอ่านหนังสือ" },
      { status: 500 }
    );
  }
}
