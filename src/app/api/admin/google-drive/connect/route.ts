import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { getGoogleDriveAuthorizationUrl, isGoogleDriveConfigured } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    if (!isGoogleDriveConfigured()) return NextResponse.redirect(new URL("/admin?drive=not-configured", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    const state = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set("lmsound_google_drive_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
    return NextResponse.redirect(getGoogleDriveAuthorizationUrl(state));
  } catch {
    return NextResponse.redirect(new URL("/login?next=/admin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
