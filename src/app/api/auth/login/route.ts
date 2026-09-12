import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { userService } from "@/lib/user-service";
import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const { emailOrUsername, password } = parseResult.data;

    const user = await userService.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Generate Session & Cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
