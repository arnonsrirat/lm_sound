"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, assertSpotOwnership, ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { updateSiteSettings, type SiteSettings, type FestivalTheme } from "@/lib/site-settings";
import { spotSchema, type SpotInput } from "@/lib/validations/spot";
import type { ActionResult } from "@/actions/spot";
import { FALLBACK_SPOTS } from "@/lib/fallbackSpots";

export async function saveSpotNoiseSampleAction(input: {
  spotId: string;
  mediaAssetId: string;
  timeSlot: string;
  note?: string | null;
  noiseScore?: number | null;
}) {
  try {
    await requireAdmin();
    const timeSlot = input.timeSlot.trim().slice(0, 40);
    if (!input.spotId || !input.mediaAssetId || !timeSlot) return { success: false, error: "กรุณาระบุสถานที่ ไฟล์เสียง และช่วงเวลา", statusCode: 400 };
    const [spot, asset] = await Promise.all([
      prisma.spot.findUnique({ where: { id: input.spotId }, select: { id: true, noiseSampleTarget: true } }),
      prisma.mediaAsset.findFirst({ where: { id: input.mediaAssetId, folder: "audio" }, select: { id: true } }),
    ]);
    if (!spot) return { success: false, error: "ไม่พบสถานที่ที่เลือก", statusCode: 404 };
    if (!asset) return { success: false, error: "ไฟล์นี้ไม่ใช่เสียงตัวอย่างในคลังเสียง", statusCode: 400 };
    const noiseScore = input.noiseScore == null ? null : Math.max(0, Math.min(100, Math.round(input.noiseScore)));
    const sample = await prisma.spotNoiseSample.upsert({
      where: { spotId_timeSlot: { spotId: spot.id, timeSlot } },
      create: { spotId: spot.id, mediaAssetId: asset.id, timeSlot, note: input.note?.trim().slice(0, 200) || null, noiseScore },
      update: { mediaAssetId: asset.id, note: input.note?.trim().slice(0, 200) || null, noiseScore },
      include: { mediaAsset: { select: { url: true, originalName: true, name: true } } },
    });
    const samples = await prisma.spotNoiseSample.findMany({ where: { spotId: spot.id }, select: { noiseScore: true } });
    const scored = samples.map((item) => item.noiseScore).filter((score): score is number => score != null);
    const average = scored.length ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length) : 0;
    const level = average < 34 ? "quiet" : average < 67 ? "moderate" : "lively";
    await prisma.spot.update({ where: { id: spot.id }, data: { noiseScore: average, noiseLevel: level, noiseSampleCount: samples.length, noiseAnalyzedAt: new Date() } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: { sample, sampleCount: samples.length, sampleTarget: spot.noiseSampleTarget, noiseScore: average, noiseLevel: level }, statusCode: 200 };
  } catch (error) {
    console.error("Save Spot Noise Sample Error:", error);
    return { success: false, error: "บันทึกเสียงตัวอย่างไม่สำเร็จ", statusCode: 500 };
  }
}

const settingsSchema = z.object({
  logoLight: z.string().min(1, "กรุณาระบุโลโก้ธีมสว่าง"),
  logoDark: z.string().min(1, "กรุณาระบุโลโก้ธีมมืด"),
  faviconLight: z.string().min(1, "กรุณาระบุ Favicon ธีมสว่าง"),
  faviconDark: z.string().min(1, "กรุณาระบุ Favicon ธีมมืด"),
  bannerLight: z.string().min(1, "กรุณาระบุแบนเนอร์ธีมสว่าง"),
  bannerDark: z.string().min(1, "กรุณาระบุแบนเนอร์ธีมมืด"),
  bgLight: z.string().optional().default("/dreamy-lake-bg.png"),
  siteName: z.string().min(1, "กรุณาระบุชื่อเว็บไซต์").max(60, "ชื่อเว็บไซต์ต้องไม่เกิน 60 ตัวอักษร"),
  siteTagline: z.string().max(120, "สโลแกนต้องไม่เกิน 120 ตัวอักษร"),
  festivalTheme: z.enum(["default", "songkran", "loykratong", "newyear", "christmas"], {
    message: "ธีมเทศกาลไม่ถูกต้อง",
  }),
  festivalStartDate: z.string().optional(),
  festivalEndDate: z.string().optional(),
  festivalStartTime: z.string().optional(),
  festivalEndTime: z.string().optional(),
  bannerTitle: z.string().max(150, "หัวข้อแบนเนอร์ต้องไม่เกิน 150 ตัวอักษร"),
  bannerSubtitle: z.string().max(300, "ข้อความแบนเนอร์ต้องไม่เกิน 300 ตัวอักษร"),
  // สีธีม (ควบคุมโดยแอดมินจากแท็บธีม → inject เป็น CSS Variables บน <html>)
  primaryColor: z.string().optional().default("#8b5cf6"),
  accentColor: z.string().optional().default("#0284c7"),
  surfaceColor: z.string().optional().default("#ffffff"),
  backgroundColor: z.string().optional().default("#fbf9ff"),
  foregroundColor: z.string().optional().default("#1f1035"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/**
 * บันทึกการตั้งค่าเว็บไซต์ (เฉพาะแอดมิน)
 */
export async function updateSiteSettingsAction(
  input: SettingsInput
): Promise<ActionResult<SiteSettings>> {
  try {
    await requireAdmin();

    const validated = settingsSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: Object.values(validated.error.flatten().fieldErrors).flat().filter(Boolean).join(" • ") || "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
        fieldErrors: validated.error.flatten().fieldErrors,
        statusCode: 400,
      };
    }

    const settings = await updateSiteSettings(validated.data);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data: settings, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Update Settings Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า", statusCode: 500 };
  }
}

/**
 * แอดมินสร้างจุดอ่านหนังสือ/ห้องอัดเสียง/สถานที่ใหม่ (authorId เป็นแอดมินเอง)
 */
export async function adminCreateSpotAction(
  formData: FormData | SpotInput
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    let rawData: Record<string, unknown>;
    if (formData instanceof FormData) {
      rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        noiseLevel: formData.get("noiseLevel"),
        imageUrl: formData.get("imageUrl"),
        imageUrls: formData.getAll("imageUrls"),
        audioUrl: formData.get("audioUrl"),
        timeTag: formData.get("timeTag") || null,
        timeStart: formData.get("timeStart") ? Number(formData.get("timeStart")) : null,
        timeEnd: formData.get("timeEnd") ? Number(formData.get("timeEnd")) : null,
        availabilityStatus: formData.get("availabilityStatus") || "READY",
        pendingFields: formData.getAll("pendingFields"),
        amenities: formData.getAll("amenities"),
        latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
        longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
      };
    } else {
      rawData = formData;
    }

    const validated = spotSchema.safeParse({
      ...rawData,
      imageUrls: Array.isArray(rawData.imageUrls) ? rawData.imageUrls.filter((value): value is string => typeof value === "string" && value.length > 0) : [],
    });
    if (!validated.success) {
      return {
        success: false,
        error: Object.values(validated.error.flatten().fieldErrors).flat().filter(Boolean).join(" • ") || "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
        fieldErrors: validated.error.flatten().fieldErrors,
        statusCode: 400,
      };
    }

    let spot;
    try {
      spot = await prisma.spot.create({
        data: { ...validated.data, authorId: session.userId },
        include: { author: { select: { id: true, username: true } } },
      });
    } catch {
      const fallbackSpot = { ...validated.data, id: `local-${Date.now()}`, authorId: session.userId, author: { id: session.userId, username: session.username }, createdAt: new Date(), updatedAt: new Date() };
      FALLBACK_SPOTS.unshift(fallbackSpot);
      spot = fallbackSpot;
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data: spot, statusCode: 201 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Admin Create Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างสถานที่", statusCode: 500 };
  }
}

/**
 * แอดมินอัปเดตสถานที่ใดก็ได้ (ไม่ต้องเป็นเจ้าของ)
 */
export async function adminUpdateSpotAction(
  spotId: string,
  formData: FormData | SpotInput
): Promise<ActionResult> {
  try {
    await requireAdmin();

    let rawData: Record<string, unknown>;
    if (formData instanceof FormData) {
      rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        noiseLevel: formData.get("noiseLevel"),
        imageUrl: formData.get("imageUrl"),
        imageUrls: formData.getAll("imageUrls"),
        audioUrl: formData.get("audioUrl"),
        timeTag: formData.get("timeTag") || null,
        timeStart: formData.get("timeStart") ? Number(formData.get("timeStart")) : null,
        timeEnd: formData.get("timeEnd") ? Number(formData.get("timeEnd")) : null,
        availabilityStatus: formData.get("availabilityStatus") || "READY",
        pendingFields: formData.getAll("pendingFields"),
        amenities: formData.getAll("amenities"),
        latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
        longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
      };
    } else {
      rawData = formData;
    }

    const fallbackIndex = FALLBACK_SPOTS.findIndex((spot) => spot.id === spotId);
    const validated = spotSchema.safeParse({
      ...rawData,
      imageUrls: Array.isArray(rawData.imageUrls) ? rawData.imageUrls.filter((value): value is string => typeof value === "string" && value.length > 0) : [],
    });
    if (!validated.success) {
      return {
        success: false,
        error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
        fieldErrors: validated.error.flatten().fieldErrors,
        statusCode: 400,
      };
    }

    if (fallbackIndex >= 0) {
      const updated = {
        ...FALLBACK_SPOTS[fallbackIndex],
        ...validated.data,
        updatedAt: new Date(),
      };
      FALLBACK_SPOTS[fallbackIndex] = updated;
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true, data: updated, statusCode: 200 };
    }

    const existing = await prisma.spot.findUnique({ where: { id: spotId }, select: { id: true } });
    if (!existing) {
      return { success: false, error: "ไม่พบสถานที่นี้ในระบบ (404)", statusCode: 404 };
    }

    const updated = await prisma.spot.update({
      where: { id: spotId },
      data: validated.data,
      include: { author: { select: { id: true, username: true } } },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/spots/${spotId}`);

    return { success: true, data: updated, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Admin Update Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตสถานที่", statusCode: 500 };
  }
}

/**
 * แอดมินลบสถานที่ใดก็ได้
 */
export async function adminDeleteSpotAction(spotId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const fallbackIndex = FALLBACK_SPOTS.findIndex((spot) => spot.id === spotId);
    if (fallbackIndex >= 0) {
      FALLBACK_SPOTS.splice(fallbackIndex, 1);
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true, statusCode: 200 };
    }

    const existing = await prisma.spot.findUnique({ where: { id: spotId }, select: { id: true } });
    if (!existing) {
      return { success: false, error: "ไม่พบสถานที่นี้ในระบบ (404)", statusCode: 404 };
    }

    await prisma.spot.delete({ where: { id: spotId } });

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Admin Delete Spot Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบสถานที่", statusCode: 500 };
  }
}

/**
 * แอดมินเปลี่ยน role ของผู้ใช้ (USER ⇄ ADMIN)
 */
export async function setUserRoleAction(
  userId: string,
  role: "USER" | "ADMIN"
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    if (session.userId === userId) {
      return { success: false, error: "ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้", statusCode: 400 };
    }

    await prisma.user.update({ where: { id: userId }, data: { role } });

    revalidatePath("/admin");

    return { success: true, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Set User Role Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์ผู้ใช้", statusCode: 500 };
  }
}

/**
 * แอดมินดึงรายการผู้ใช้งานทั้งหมดในระบบ
 */
export async function getAdminUsersAction(): Promise<
  ActionResult<Array<{ id: string; email: string; username: string; role: "USER" | "ADMIN"; createdAt: string | Date }>>
> {
  try {
    await requireAdmin();
    const { userService } = await import("@/lib/user-service");
    const users = await userService.listUsers();
    return { success: true, data: users, statusCode: 200 };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: err.message, statusCode: 403 };
    }
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message, statusCode: 401 };
    }
    console.error("Get Admin Users Error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดรายการผู้ใช้", statusCode: 500 };
  }
}
