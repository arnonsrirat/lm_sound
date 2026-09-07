import { z } from "zod";

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .trim()
    .min(3, { message: "กรุณากรอกอีเมลหรือชื่อผู้ใช้ อย่างน้อย 3 ตัวอักษร" }),
  password: z
    .string()
    .min(6, { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" })
      .max(30, { message: "ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และขีดล่าง (_)",
      }),
    email: z
      .string()
      .trim()
      .email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    name: z
      .string()
      .trim()
      .max(50, { message: "ชื่อต้องไม่เกิน 50 ตัวอักษร" })
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }),
    confirmPassword: z
      .string()
      .min(6, { message: "กรุณายืนยันรหัสผ่าน" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
