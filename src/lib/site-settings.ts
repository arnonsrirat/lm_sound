import "server-only";
import { prisma } from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";
import {
  type FestivalTheme,
  type SiteSettings,
  DEFAULT_SITE_SETTINGS,
  FESTIVAL_THEME_LABELS,
} from "./site-settings-constants";

export {
  type FestivalTheme,
  type SiteSettings,
  DEFAULT_SITE_SETTINGS,
  FESTIVAL_THEME_LABELS,
};

const SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettings)[];

function isFestivalTheme(v: string): v is FestivalTheme {
  return ["default", "songkran", "loykratong", "newyear", "christmas"].includes(v);
}

const LOCAL_SETTINGS_FILE = path.join(process.cwd(), "data", "site-settings.json");

async function readLocalSettings(): Promise<Partial<SiteSettings>> {
  try {
    const raw = await fs.readFile(LOCAL_SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLocalSettings(data: Partial<SiteSettings>): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_SETTINGS_FILE);
    await fs.mkdir(dir, { recursive: true });
    const existing = await readLocalSettings();
    const merged = { ...existing, ...data };
    await fs.writeFile(LOCAL_SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save site settings to local fallback file:", err);
  }
}

/** ดึงค่าตั้งค่าทั้งหมด — ถ้า DB ใช้ไม่ได้ ใช้อ่านจาก local JSON fallback หรือค่าเริ่มต้น (เว็บไม่พัง) */
export async function getSiteSettings(): Promise<SiteSettings> {
  let result: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
  
  // 1. อ่านจาก local fallback file ก่อน
  const localSettings = await readLocalSettings();
  result = { ...result, ...localSettings };

  // 2. ถ้ามี DB ให้อ่านจาก DB
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl && !dbUrl.includes("ep-sample") && !dbUrl.includes("dummy")) {
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
      // DB ไม่พร้อม — ใช้ค่าที่มี
    }
  }

  return result;
}

/** บันทึกค่าตั้งค่าหลายค่าพร้อมกัน (สำหรับแอดมิน) */
export async function updateSiteSettings(
  values: Partial<SiteSettings>
): Promise<SiteSettings> {
  // บันทึกลง local file fallback เสมอ
  await writeLocalSettings(values);

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl || dbUrl.includes("ep-sample") || dbUrl.includes("dummy")) {
    return getSiteSettings();
  }

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
