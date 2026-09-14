import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { saveGoogleDriveAuthorization } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  try {
    await requireAdmin();
    const error = request.nextUrl.searchParams.get("error");
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const cookieStore = await cookies();
    const expectedState = cookieStore.get("lmsound_google_drive_state")?.value;
    cookieStore.delete("lmsound_google_drive_state");
    if (error || !code || !state || state !== expectedState) return NextResponse.redirect(new URL("/admin?drive=cancelled", baseUrl));
    await saveGoogleDriveAuthorization(code);
    return NextResponse.redirect(new URL("/admin?drive=connected", baseUrl));
  } catch {
    return NextResponse.redirect(new URL("/admin?drive=error", baseUrl));
  }
}
