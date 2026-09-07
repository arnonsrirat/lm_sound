"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { spotSchema, type SpotInput } from "@/lib/validations/spot";
import { requireAuth, assertSpotOwnership, ForbiddenError, UnauthorizedError } from "@/lib/auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * 1. Create Spot (Server Action)
 * บันทึกจุดอ่านหนังสือใหม่ พร้อมผูก authorId จาก Session
 */
export async function createSpotAction(formData: FormData | SpotInput): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    let rawData: Record<string, unknown>;
    if (formData instanceof FormData) {
      rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        noiseLevel: formData.get("noiseLevel"),
        imageUrl: formData.get("imageUrl"),
        audioUrl: formData.get("audioUrl"),
      };
    } else {
      rawData = formData;
    }

    const validated = spotSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
        fieldErrors: validated.error.flatten().fieldErrors,
        statusCode: 400,
      };
    }

    const spot = await prisma.spot.create({
      data: {
        ...validated.data,
        authorId: session.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/spots");

    return {
      success: true,
      data: spot,
      statusCode: 201,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Create Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างจุดอ่านหนังสือ", statusCode: 500 };
  }
}

/**
 * 2. Read Spots (Feed)
 * ดึงรายการจุดอ่านหนังสือทั้งหมด พร้อมรองรับ Search และ Filter ระดับเสียง
 */
export async function getSpots(options?: {
  search?: string;
  noiseLevel?: string;
  take?: number;
  skip?: number;
}) {
  try {
    const { search, noiseLevel, take = 50, skip = 0 } = options || {};

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
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    });

    return spots;
  } catch (error) {
    console.error("getSpots Error:", error);
    return [];
  }
}

/**
 * 3. Read Spot by ID
 * ดึงข้อมูลจุดอ่านหนังสือเฉพาะจุด
 */
export async function getSpotById(id: string) {
  try {
    const spot = await prisma.spot.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    return spot;
  } catch (error) {
    console.error("getSpotById Error:", error);
    return null;
  }
}

/**
 * 4. Update Spot (Server Action)
 * อัปเดตข้อมูลจุดอ่านหนังสือ พร้อม Authorization Guard เช็ค session.userId === spot.authorId
 */
export async function updateSpotAction(
  spotId: string,
  formData: FormData | SpotInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    // ค้นหา Spot เดิมก่อน
    const existingSpot = await prisma.spot.findUnique({
      where: { id: spotId },
      select: { authorId: true },
    });

    if (!existingSpot) {
      return { success: false, error: "ไม่พบจุดอ่านหนังสือนี้ในระบบ (404)", statusCode: 404 };
    }

    // Authorization Guard: สิทธิ์เฉพาะเจ้าของโพสต์เท่านั้น (403)
    assertSpotOwnership(existingSpot.authorId, session.userId);

    let rawData: Record<string, unknown>;
    if (formData instanceof FormData) {
      rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        noiseLevel: formData.get("noiseLevel"),
        imageUrl: formData.get("imageUrl"),
        audioUrl: formData.get("audioUrl"),
      };
    } else {
      rawData = formData;
    }

    const validated = spotSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
        fieldErrors: validated.error.flatten().fieldErrors,
        statusCode: 400,
      };
    }

    const updated = await prisma.spot.update({
      where: { id: spotId },
      data: validated.data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/spots/${spotId}`);
    revalidatePath("/spots");

    return { success: true, data: updated, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Update Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตจุดอ่านหนังสือ", statusCode: 500 };
  }
}

/**
 * 5. Delete Spot (Server Action)
 * ลบจุดอ่านหนังสือ พร้อม Authorization Guard เช็ค session.userId === spot.authorId
 */
export async function deleteSpotAction(spotId: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const existingSpot = await prisma.spot.findUnique({
      where: { id: spotId },
      select: { authorId: true },
    });

    if (!existingSpot) {
      return { success: false, error: "ไม่พบจุดอ่านหนังสือนี้ในระบบ (404)", statusCode: 404 };
    }

    // Authorization Guard: 403 Forbidden
    assertSpotOwnership(existingSpot.authorId, session.userId);

    await prisma.spot.delete({
      where: { id: spotId },
    });

    revalidatePath("/");
    revalidatePath("/spots");

    return { success: true, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Delete Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบจุดอ่านหนังสือ", statusCode: 500 };
  }
}
