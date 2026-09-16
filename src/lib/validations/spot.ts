import { z } from "zod";

export const noiseLevels = ["quiet", "moderate", "lively"] as const;
export type NoiseLevel = (typeof noiseLevels)[number];
export const availabilityStatuses = ["READY", "PENDING_UPDATE", "NOT_READY"] as const;
export type AvailabilityStatus = (typeof availabilityStatuses)[number];
export const timeTags = ["morning", "afternoon", "evening", "night", "all_day"] as const;
export type TimeTag = (typeof timeTags)[number];
export function isSpotAvailableAtHour(start: number | null | undefined, end: number | null | undefined, hour: number): boolean {
  if (start == null || end == null) return true;
  if (start === end) return true;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}
export const pendingFieldKeys = ["description", "noiseLevel", "images", "audio", "timeTag", "location"] as const;
export type PendingFieldKey = (typeof pendingFieldKeys)[number];
export const amenityKeys = ["power", "wifi", "lighting", "aircon", "fan", "other"] as const;
export type AmenityKey = (typeof amenityKeys)[number];

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
  description: z.string().max(2000, "รายละเอียดต้องไม่เกิน 2000 ตัวอักษร").default(""),
  location: z
    .string()
    .min(2, "ระบุตำแหน่งหรือพิกัด เช่น ชั้น, ตึก, โซน")
    .max(150, "ตำแหน่งต้องไม่เกิน 150 ตัวอักษร"),
  noiseLevel: z.enum(noiseLevels, {
    message: "กรุณาเลือกระดับเสียงรบกวน",
  }).default("quiet"),
  imageUrl: z
    .string()
    .url("รูปแบบ URL รูปภาพไม่ถูกต้อง")
    .or(z.string().regex(/^\/[a-zA-Z0-9_\-\/.]+\.(jpg|jpeg|png|webp|avif)$/i, "พาธรูปภาพต้องเป็นไฟล์ภาพ"))
    .or(z.string().regex(/^\/api\/admin\/media\/[a-zA-Z0-9_-]+$/, "พาธรูปภาพจากคลังไม่ถูกต้อง"))
    .or(z.literal(""))
    .default(""),
  imageUrls: z.array(z.string().min(1)).max(20).default([]),
  audioUrl: z
    .string()
    .url("รูปแบบ URL เสียงไม่ถูกต้อง")
    .or(z.string().regex(/^\/[a-zA-Z0-9_\-\/.]+\.(mp3|wav|ogg|m4a)$/i, "พาธเสียงต้องเป็นไฟล์เสียง"))
    .or(z.string().regex(/^\/api\/admin\/media\/[a-zA-Z0-9_-]+$/, "พาธเสียงจากคลังไม่ถูกต้อง"))
    .or(z.literal(""))
    .default(""),
  timeTag: z.enum(timeTags).nullable().optional(),
  timeStart: z.number().int().min(0).max(23).nullable().optional(),
  timeEnd: z.number().int().min(0).max(23).nullable().optional(),
  availabilityStatus: z.enum(availabilityStatuses).default("READY"),
  pendingFields: z.array(z.enum(pendingFieldKeys)).default([]),
  amenities: z.array(z.enum(amenityKeys)).default([]),
  latitude: z.number().finite().min(7.78).max(7.84).optional(),
  longitude: z.number().finite().min(99.90).max(99.98).optional(),
}).superRefine((value, ctx) => {
  if (!value.pendingFields.includes("description") && value.description.trim().length < 10) {
    ctx.addIssue({ code: "custom", path: ["description"], message: "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร หรือเลือก 'รออัปเดต'" });
  }
  if (!value.pendingFields.includes("images") && !value.imageUrl) {
    ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "กรุณาเลือกรูปภาพ หรือเลือก 'รออัปเดต'" });
  }
  if (!value.pendingFields.includes("audio") && !value.audioUrl) {
    ctx.addIssue({ code: "custom", path: ["audioUrl"], message: "กรุณาเลือกเสียง หรือเลือก 'รออัปเดต'" });
  }
});

export type SpotInput = z.infer<typeof spotSchema>;
