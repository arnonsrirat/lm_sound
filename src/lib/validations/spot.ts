import { z } from "zod";

export const noiseLevels = ["quiet", "moderate", "lively"] as const;
export type NoiseLevel = (typeof noiseLevels)[number];

export const noiseLevelLabels: Record<NoiseLevel, { label: string; desc: string; badgeColor: string }> = {
  quiet: {
    label: "เงียบสงบ",
    desc: "เหมาะสำหรับอ่านหนังสือที่ต้องใช้สมาธิสูง",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  moderate: {
    label: "ปานกลาง",
    desc: "มีเสียงแอร์หรือเสียงกระซิบเบาๆ",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  lively: {
    label: "คึกคัก / คาเฟ่",
    desc: "มีเสียงคนคุยกันหรือเสียงแก้วกาแฟ",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
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
