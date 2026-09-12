import { prisma } from "@/lib/prisma";

/**
 * การตั้งค่าเว็บไซต์ทั้งหมดเก็บในตาราง SiteSetting แบบ key-value
 * แอดมินแก้ได้เองจากหน้า /admin โดยไม่ต้องแก้โค้ด
 *
 * โลโก้และแบนเนอร์แยกกันระหว่างธีมสว่าง (light) และธีมมืด (dark)
 * และมี "ธีมเทศกาล" (festivalTheme) ที่สามารถสลับชุดสีทั้งเว็บได้
 */

export type FestivalTheme = "default" | "songkran" | "loykratong" | "newyear" | "christmas";

export interface SiteSettings {
  // โลโก้ — แยกตามธีมสว่าง/มืด
  logoLight: string;
  logoDark: string;
  // แบนเนอร์ — แยกตามธีมสว่าง/มืด (ใช้เป็นภาพพื้นหลังของ FeaturedBanner)
  bannerLight: string;
  bannerDark: string;
  // ชื่อเว็บ + สโลแกน
  siteName: string;
  siteTagline: string;
  // ธีมเทศกาล
  festivalTheme: FestivalTheme;
  // ข้อความหัวแบนเนอร์
  bannerTitle: string;
  bannerSubtitle: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoLight: "/logo.png",
  logoDark: "/logo.png",
  bannerLight: "/logo.png",
  bannerDark: "/logo.png",
  siteName: "LM Sound",
  siteTagline: "Spatial & Ambient Soundscape",
  festivalTheme: "default",
  bannerTitle: "เสียงแนะนำ (Recommended Soundscape)",
  bannerSubtitle: "ค้นพบมุมอ่านหนังสือที่ใช่ พร้อมเสียงบรรยากาศจริงก่อนเดินทาง",
};

export const FESTIVAL_THEME_LABELS: Record<FestivalTheme, string> = {
  default: "ค่าเริ่มต้น (พาสเทลม่วง)",
  songkran: "สงกรานต์ (ฟ้าสดชื่น)",
  loykratong: "ลอยกระทง (ม่วงน้ำเงิน)",
  newyear: "ปีใหม่ (ทอง-ม่วง)",
  christmas: "คริสต์มาส (แดง-ม่วง)",
};

const SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettings)[];

function isFestivalTheme(v: string): v is FestivalTheme {
  return ["default", "songkran", "loykratong", "newyear", "christmas"].includes(v);
}

/** ดึงค่าตั้งค่าทั้งหมด — ถ้า DB ใช้ไม่ได้ คืนค่าเริ่มต้น (เว็บไม่พัง) */
export async function getSiteSettings(): Promise<SiteSettings> {
  const result: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      if (SETTING_KEYS.includes(row.key as keyof SiteSettings)) {
        const key = row.key as keyof SiteSettings;
        if (key === "festivalTheme" && isFestivalTheme(row.value)) {
          result.festivalTheme = row.value;
        } else if (key !== "festivalTheme") {
          (result[key] as string) = row.value;
        }
      }
    }
  } catch {
    // DB ไม่พร้อม — ใช้ค่าเริ่มต้น
  }
  return result;
}

/** บันทึกค่าตั้งค่าหลายค่าพร้อมกัน (สำหรับแอดมิน) */
export async function updateSiteSettings(
  values: Partial<SiteSettings>
): Promise<SiteSettings> {
  const updates = Object.entries(values).filter(
    ([key]) => SETTING_KEYS.includes(key as keyof SiteSettings)
  );

  for (const [key, value] of updates) {
    if (key === "festivalTheme" && !isFestivalTheme(String(value))) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return getSiteSettings();
}
