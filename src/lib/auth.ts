import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string = "Forbidden: คุณไม่มีสิทธิ์ในการดำเนินการนี้ (403)") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string = "Unauthorized: กรุณาเข้าสู่ระบบก่อนดำเนินการ (401)") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export interface SessionUser {
  userId: string;
  email: string;
  username: string;
}

/**
 * ดึงข้อมูล Session จาก Cookie
 * รองรับทั้ง session cookie จากระบบ Auth ของ Ninja (เช่น `session_token` หรือ `session_user`)
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user")?.value || cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // รองรับ JSON session cookie
    const parsed = JSON.parse(sessionCookie);
    if (parsed && (parsed.userId || parsed.id)) {
      return {
        userId: parsed.userId || parsed.id,
        email: parsed.email || "",
        username: parsed.username || "",
      };
    }
  } catch {
    // หากเป็น token ธรรมดา หรือ userId ตรงๆ
    return {
      userId: sessionCookie,
      email: "",
      username: "",
    };
  }

  return null;
}

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่ ถ้าไม่จะโยน UnauthorizedError (401)
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Authorization Guard:
 * ดักจับสิทธิ์ให้แก้ไขหรือลบได้เฉพาะ session.userId === spot.authorId เท่านั้น
 * หากไม่ใช่จะโยน ForbiddenError (403) ทันที
 */
export function assertSpotOwnership(authorId: string, currentUserId: string): void {
  if (authorId !== currentUserId) {
    throw new ForbiddenError("403 Forbidden: คุณไม่มีสิทธิ์แก้ไขหรือลบจุดอ่านหนังสือนี้ เนื่องจากไม่ใช่เจ้าของโพสต์");
  }
}
