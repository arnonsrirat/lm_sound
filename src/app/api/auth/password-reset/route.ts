import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
function digest(value: string) { return crypto.createHash("sha256").update(value).digest("hex"); }
async function sendMail(to: string, code: string) { const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!key || !from) throw new Error("ยังไม่ได้ตั้งค่า RESEND_API_KEY หรือ RESEND_FROM_EMAIL"); const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject: "รหัสยืนยันการตั้งรหัสผ่าน LMSound", html: `<p>รหัสยืนยันของคุณคือ <strong>${code}</strong></p><p>รหัสนี้มีอายุ 15 นาที</p>` }) }); if (!response.ok) throw new Error("ส่งอีเมลไม่สำเร็จ"); }
export async function POST(request: NextRequest) {
  const body = await request.json() as { action?: "request" | "reset"; email?: string; code?: string; password?: string };
  const email = body.email?.trim().toLowerCase(); if (!email) return NextResponse.json({ success: false, error: "กรุณาระบุอีเมล" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (body.action === "request") { if (user) { const code = String(crypto.randomInt(100000, 1000000)); await prisma.authToken.deleteMany({ where: { userId: user.id, purpose: "PASSWORD_RESET" } }); await prisma.authToken.create({ data: { userId: user.id, tokenHash: digest(code), purpose: "PASSWORD_RESET", expiresAt: new Date(Date.now() + 15 * 60 * 1000) } }); try { await sendMail(email, code); } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "ส่งอีเมลไม่สำเร็จ" }, { status: 503 }); } } return NextResponse.json({ success: true, message: "ถ้ามีบัญชีนี้ ระบบได้ส่งรหัสยืนยันไปยังอีเมลแล้ว" }); }
  if (!user || !body.code || !body.password || body.password.length < 8) return NextResponse.json({ success: false, error: "อีเมล รหัสยืนยัน หรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
  const token = await prisma.authToken.findFirst({ where: { userId: user.id, purpose: "PASSWORD_RESET", tokenHash: digest(body.code), expiresAt: { gt: new Date() } } }); if (!token) return NextResponse.json({ success: false, error: "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(body.password) } }); await prisma.authToken.delete({ where: { id: token.id } }); return NextResponse.json({ success: true, message: "ตั้งรหัสผ่านใหม่สำเร็จ" });
}
