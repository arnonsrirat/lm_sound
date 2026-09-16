import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { userService } from "@/lib/user-service";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const { username, email, name, password } = parseResult.data;

    // Check duplicate email
    const existingByEmail = await userService.findByEmailOrUsername(email);
    if (existingByEmail) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น" },
        { status: 409 }
      );
    }

    // Check duplicate username
    const existingByUsername = await userService.findByEmailOrUsername(username);
    if (existingByUsername) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น" },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const newUser = await userService.createUser({
      email,
      username,
      passwordHash,
      name: name || null,
    });

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.DATABASE_URL) {
      const code = String(crypto.randomInt(100000, 1000000));
      await prisma.authToken.create({ data: { userId: newUser.id, tokenHash: crypto.createHash("sha256").update(code).digest("hex"), purpose: "EMAIL_VERIFY", expiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
      const mail = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [newUser.email], subject: "ยืนยันอีเมล LMSound", html: `<p>รหัสยืนยันอีเมลของคุณคือ <strong>${code}</strong></p><p>รหัสนี้มีอายุ 15 นาที</p>` }) });
      if (!mail.ok) return NextResponse.json({ error: "สมัครสมาชิกแล้ว แต่ส่งรหัสยืนยันไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
      return NextResponse.json({ success: true, requiresVerification: true, email: newUser.email, message: "สมัครสมาชิกสำเร็จ กรุณายืนยันรหัสจากอีเมลก่อนเข้าสู่ระบบ" }, { status: 201 });
    }

    // Generate Session & Cookie
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      role: "USER",
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
