import { z } from "zod";

export const noiseLevels = ["quiet", "moderate", "lively"] as const;
export type NoiseLevel = (typeof noiseLevels)[number];

export const noiseLevelLabels: Record<NoiseLevel, { label: string; desc: string; badgeColor: string }> = {
  quiet: {
    label: "เงียบสงบ",
    desc: "เหมาะสำหรับอ่านหนังสือที่ต้องใช้สมาธิสูง",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  moderate: {
    label: "ปานกลาง",
    desc: "มีเสียงแอร์หรือเสียงกระซิบเบาๆ",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  lively: {
    label: "คึกคัก / คาเฟ่",
    desc: "มีเสียงคนคุยกันหรือเสียงแก้วกาแฟ",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  },
};

export const spotSchema = z.object({
  title: z
    .string()
    .min(2, "ชื่อสถานที่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อสถานที่ต้องไม่เกิน 100 ตัวอักษร"),
  description: z
    .string()
    .min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(2000, "รายละเอียดต้องไม่เกิน 2000 ตัวอักษร"),
  location: z
    .string()
    .min(2, "ระบุตำแหน่งหรือพิกัด เช่น ชั้น, ตึก, โซน")
    .max(150, "ตำแหน่งต้องไม่เกิน 150 ตัวอักษร"),
  noiseLevel: z.enum(noiseLevels, {
    message: "กรุณาเลือกระดับเสียงรบกวน",
  }),
  imageUrl: z
    .string()
    .min(1, "กรุณาระบุ URL ของรูปภาพ")
    .url("รูปแบบ URL รูปภาพไม่ถูกต้อง")
    .or(z.string().regex(/^\/[a-zA-Z0-9_\-\/.]+\.(jpg|jpeg|png|webp|avif)$/i, "พาธรูปภาพต้องเป็นไฟล์ภาพ")),
  audioUrl: z
    .string()
    .min(1, "กรุณาระบุ URL ของไฟล์เสียงบรรยากาศ")
    .url("รูปแบบ URL เสียงไม่ถูกต้อง")
    .or(z.string().regex(/^\/[a-zA-Z0-9_\-\/.]+\.(mp3|wav|ogg|m4a)$/i, "พาธเสียงต้องเป็นไฟล์เสียง")),
});

export type SpotInput = z.infer<typeof spotSchema>;
