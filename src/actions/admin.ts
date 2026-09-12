"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, assertSpotOwnership, ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { updateSiteSettings, type SiteSettings, type FestivalTheme } from "@/lib/site-settings";
import { spotSchema, type SpotInput } from "@/lib/validations/spot";
import type { ActionResult } from "@/actions/spot";

const settingsSchema = z.object({
  logoLight: z.string().min(1, "กรุณาระบุโลโก้ธีมสว่าง"),
  logoDark: z.string().min(1, "กรุณาระบุโลโก้ธีมมืด"),
  bannerLight: z.string().min(1, "กรุณาระบุแบนเนอร์ธีมสว่าง"),
  bannerDark: z.string().min(1, "กรุณาระบุแบนเนอร์ธีมมืด"),
  siteName: z.string().min(1, "กรุณาระบุชื่อเว็บไซต์").max(60, "ชื่อเว็บไซต์ต้องไม่เกิน 60 ตัวอักษร"),
  siteTagline: z.string().max(120, "สโลแกนต้องไม่เกิน 120 ตัวอักษร"),
  festivalTheme: z.enum(["default", "songkran", "loykratong", "newyear", "christmas"], {
    message: "ธีมเทศกาลไม่ถูกต้อง",
  }),
  bannerTitle: z.string().max(150, "หัวข้อแบนเนอร์ต้องไม่เกิน 150 ตัวอักษร"),
  bannerSubtitle: z.string().max(300, "ข้อความแบนเนอร์ต้องไม่เกิน 300 ตัวอักษร"),
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
        error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ต่างๆ",
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
      include: { author: { select: { id: true, username: true } } },
    });

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

    const existing = await prisma.spot.findUnique({ where: { id: spotId }, select: { id: true } });
    if (!existing) {
      return { success: false, error: "ไม่พบสถานที่นี้ในระบบ (404)", statusCode: 404 };
    }

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
