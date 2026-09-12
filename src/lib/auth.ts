import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { userService, UserRecord } from "./user-service";

export const SESSION_COOKIE_NAME = "lm_sound_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lm-sound-ambient-secure-jwt-secret-key-2026"
);

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  name?: string | null;
  role?: "USER" | "ADMIN";
}

// 1. Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. JWT Session Management
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days session
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
      name: (payload.name as string) || null,
      role: payload.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch {
    return null;
  }
}

// 3. Cookie Management
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export class UnauthorizedError extends Error {
  constructor(message = "กรุณาเข้าสู่ระบบก่อนทำรายการ (401 Unauthorized)") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "คุณไม่มีสิทธิ์ดำเนินการนี้ (403 Forbidden)") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Guard สิทธิ์แอดมิน — โยน ForbiddenError หากผู้ใช้ไม่ใช่ ADMIN
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new ForbiddenError("เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่ทำรายการนี้ได้");
  }
  return session;
}

/**
 * เช็กว่า session ปัจจุบันเป็นแอดมินหรือไม่ (ไม่โยน error)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "ADMIN";
}

export function assertSpotOwnership(
  spotAuthorId: string,
  currentUserId: string,
  isAdminUser = false
): void {
  // แอดมินสามารถจัดการสถานที่ทุกจุดได้
  if (isAdminUser) return;
  if (spotAuthorId !== currentUserId) {
    throw new ForbiddenError("คุณไม่มีสิทธิ์แก้ไขหรือลบจุดอ่านหนังสือนี้ (403 Forbidden)");
  }
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getSession();
  if (!session) return null;

  return userService.findById(session.userId);
}

