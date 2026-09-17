import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  return {
    name: `${settings.siteName} - หลบมุม Sound`,
    short_name: "LMSound",
    description:
      "เว็บแอปแนะนำจุดอ่านหนังสือพร้อมเสียงบรรยากาศผ่อนคลายและสร้างสมาธิ",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090514",
    theme_color: "#7c3aed",
    icons: [
      {
        src: settings.faviconLight || "/logo-light.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: settings.faviconDark || "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: settings.faviconDark || "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
