import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LMSound - หลบมุม Sound",
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
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
