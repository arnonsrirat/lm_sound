export type FestivalTheme = "default" | "songkran" | "loykratong" | "newyear" | "christmas";

export interface SiteSettings {
  // โลโก้ — แยกตามธีมสว่าง/มืด
  logoLight: string;
  logoDark: string;
  // Favicon — แยกตามธีมสว่าง/มืด
  faviconLight: string;
  faviconDark: string;
  // แบนเนอร์ — แยกตามธีมสว่าง/มืด (ใช้เป็นภาพพื้นหลังของ FeaturedBanner)
  bannerLight: string;
  bannerDark: string;
  // ภาพพื้นหลังเว็บไซต์ — ธีมสว่าง
  bgLight: string;
  // ชื่อเว็บ + สโลแกน
  siteName: string;
  siteTagline: string;
  // ธีมเทศกาล
  festivalTheme: FestivalTheme;
  festivalStartDate: string;
  festivalEndDate: string;
  festivalStartTime: string;
  festivalEndTime: string;
  // ข้อความหัวแบนเนอร์
  bannerTitle: string;
  bannerSubtitle: string;
  // สีธีม (--theme-primary/accent/surface/background/foreground) — แอดมินปรับได้จากแท็บธีม
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  backgroundColor?: string;
  foregroundColor: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoLight: "/logo-light.png",
  logoDark: "/logo.png",
  faviconLight: "/logo-light.png",
  faviconDark: "/logo.png",
  bannerLight: "/logo-light-theme.png",
  bannerDark: "/logo.png",
  bgLight: "/dreamy-lake-bg.png",
  siteName: "LM Sound",
  siteTagline: "Spatial & Ambient Soundscape",
  festivalTheme: "default",
  festivalStartDate: "",
  festivalEndDate: "",
  festivalStartTime: "00:00",
  festivalEndTime: "23:59",
  bannerTitle: "เสียงแนะนำ (Recommended Soundscape)",
  bannerSubtitle: "ค้นพบมุมอ่านหนังสือที่ใช่ พร้อมเสียงบรรยากาศจริงก่อนเดินทาง",
  // สีธีมเริ่มต้น — พาสเทลม่วงดรีมมี่
  primaryColor: "#8b5cf6",
  accentColor: "#0284c7",
  surfaceColor: "#ffffff",
  backgroundColor: "#fbf9ff",
  foregroundColor: "#1f1035",
};

export const FESTIVAL_THEME_LABELS: Record<FestivalTheme, string> = {
  default: "ค่าเริ่มต้น (พาสเทลม่วง)",
  songkran: "สงกรานต์ (ฟ้าสดชื่น)",
  loykratong: "ลอยกระทง (ม่วงน้ำเงิน)",
  newyear: "ปีใหม่ (ทอง-ม่วง)",
  christmas: "คริสต์มาส (แดง-ม่วง)",
};
