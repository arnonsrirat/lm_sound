import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams; const code = params.get("code");
  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL("/login?error=google-login", request.url));
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
    const token = await tokenResponse.json() as { access_token?: string }; if (!token.access_token) throw new Error("Google token exchange failed");
    const profile = await (await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } })).json() as { email?: string; name?: string };
    if (!profile.email) throw new Error("Google email unavailable");
    let user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
    if (!user) { const base = profile.email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 24) || "googleuser"; let username = base; let index = 1; while (await prisma.user.findUnique({ where: { username } })) username = `${base}${index++}`; user = await prisma.user.create({ data: { email: profile.email.toLowerCase(), username, password: await hashPassword(crypto.randomUUID()) } }); }
    await setSessionCookie(await createSessionToken({ userId: user.id, email: user.email, username: user.username, name: profile.name || user.username, role: user.role === "ADMIN" ? "ADMIN" : "USER" }));
    const encodedState = params.get("state"); const next = encodedState ? Buffer.from(encodedState, "base64url").toString("utf8") : "/";
    return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url));
  } catch { return NextResponse.redirect(new URL("/login?error=google-login", request.url)); }
}
