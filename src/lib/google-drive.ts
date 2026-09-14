import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";

function config() {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || (baseUrl ? `${baseUrl}/api/admin/google-drive/callback` : undefined);
  return { clientId, clientSecret, redirectUri };
}

function encryptionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET ต้องมีอย่างน้อย 32 ตัวอักษรสำหรับเข้ารหัส Google Drive token");
  return crypto.createHash("sha256").update(secret).digest();
}

export function isGoogleDriveConfigured() {
  const { clientId, clientSecret, redirectUri } = config();
  return Boolean(clientId && clientSecret && redirectUri);
}

export function getGoogleDriveAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = config();
  if (!clientId || !redirectUri) throw new Error("ยังไม่ได้ตั้งค่า Google Drive OAuth");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", `${DRIVE_SCOPE} https://www.googleapis.com/auth/userinfo.email`);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decrypt(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Google Drive token ไม่ถูกต้อง");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
}

async function tokenRequest(params: URLSearchParams) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google Drive ไม่สามารถออก access token ได้");
  return response.json() as Promise<{ access_token: string; refresh_token?: string }>;
}

export async function saveGoogleDriveAuthorization(code: string) {
  const { clientId, clientSecret, redirectUri } = config();
  if (!clientId || !clientSecret || !redirectUri) throw new Error("ยังไม่ได้ตั้งค่า Google Drive OAuth ใน environment");
  const tokens = await tokenRequest(new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }));
  if (!tokens.refresh_token) throw new Error("Google ไม่ส่ง refresh token กลับมา กรุณาอนุญาตการเข้าถึงอีกครั้ง");
  const accountResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" });
  const account = accountResponse.ok ? await accountResponse.json() as { email?: string } : {};
  await prisma.googleDriveConnection.deleteMany();
  await prisma.googleDriveConnection.create({ data: { accountEmail: account.email || null, refreshTokenEncrypted: encrypt(tokens.refresh_token) } });
}

export async function getGoogleDriveStatus() {
  const configured = isGoogleDriveConfigured();
  const connection = configured ? await prisma.googleDriveConnection.findFirst({ orderBy: { updatedAt: "desc" } }) : null;
  return { configured, connected: Boolean(connection), accountEmail: connection?.accountEmail || null, updatedAt: connection?.updatedAt || null };
}

async function getAccessToken() {
  const { clientId, clientSecret } = config();
  const connection = await prisma.googleDriveConnection.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!connection || !clientId || !clientSecret) throw new Error("GOOGLE_DRIVE_NOT_CONNECTED");
  const refreshToken = decrypt(connection.refreshTokenEncrypted);
  const tokens = await tokenRequest(new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }));
  return { accessToken: tokens.access_token, connection };
}

async function driveRequest(url: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) }, cache: "no-store" });
  if (!response.ok) throw new Error(`Google Drive request failed (${response.status})`);
  return response;
}

async function getOrCreateFolder(accessToken: string, name: string, parentId?: string) {
  const query = [`mimeType='application/vnd.google-apps.folder'`, `name='${name.replace(/'/g, "\\'")}'`, "trashed=false"];
  if (parentId) query.push(`'${parentId}' in parents`);
  const listUrl = new URL(`${DRIVE_API}/files`);
  listUrl.searchParams.set("q", query.join(" and "));
  listUrl.searchParams.set("fields", "files(id)");
  const list = await (await driveRequest(listUrl.toString(), accessToken)).json() as { files?: Array<{ id: string }> };
  if (list.files?.[0]?.id) return list.files[0].id;
  const created = await (await driveRequest(`${DRIVE_API}/files`, accessToken, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", ...(parentId ? { parents: [parentId] } : {}) }) })).json() as { id: string };
  return created.id;
}

export async function uploadToGoogleDrive(file: File, folder: string, note: string | null = null) {
  const { accessToken, connection } = await getAccessToken();
  const rootFolderId = connection.rootFolderId || await getOrCreateFolder(accessToken, "LMSound Uploads");
  if (!connection.rootFolderId) await prisma.googleDriveConnection.update({ where: { id: connection.id }, data: { rootFolderId } });
  const folderId = await getOrCreateFolder(accessToken, folder, rootFolderId);
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
  const sequence = (await prisma.mediaAsset.count({ where: { folder } })) + 1;
  const generatedName = `lmsound_${folder}_${String(sequence).padStart(4, "0")}${extension}`;
  const boundary = `lmsound-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: generatedName, parents: [folderId] });
  const bytes = Buffer.from(await file.arrayBuffer());
  const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`), bytes, Buffer.from(`\r\n--${boundary}--`)]);
  const uploaded = await (await driveRequest(`${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name,mimeType,size,webViewLink`, accessToken, { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body })).json() as { id: string; name: string; mimeType: string; size?: string; webViewLink?: string };
  const url = `/api/admin/media/${uploaded.id}`;
  const asset = await prisma.mediaAsset.create({ data: { name: uploaded.name, note, folder, mimeType: uploaded.mimeType || file.type || "application/octet-stream", size: Number(uploaded.size || file.size), driveFileId: uploaded.id, driveWebViewUrl: uploaded.webViewLink || null, url } });
  return asset;
}

export async function getGoogleDriveFile(fileId: string) {
  const { accessToken } = await getAccessToken();
  return driveRequest(`${DRIVE_API}/files/${fileId}?alt=media`, accessToken);
}

export async function deleteGoogleDriveFile(fileId: string) {
  const { accessToken } = await getAccessToken();
  await driveRequest(`${DRIVE_API}/files/${fileId}`, accessToken, { method: "DELETE" });
}

export async function moveGoogleDriveFile(fileId: string, targetFolder: string) {
  const { accessToken, connection } = await getAccessToken();
  const rootFolderId = connection.rootFolderId || await getOrCreateFolder(accessToken, "LMSound Uploads");
  if (!connection.rootFolderId) await prisma.googleDriveConnection.update({ where: { id: connection.id }, data: { rootFolderId } });
  const folderId = await getOrCreateFolder(accessToken, targetFolder, rootFolderId);
  const current = await (await driveRequest(`${DRIVE_API}/files/${fileId}?fields=parents`, accessToken)).json() as { parents?: string[] };
  const params = new URLSearchParams({ addParents: folderId, fields: "id" });
  if (current.parents?.length) params.set("removeParents", current.parents.join(","));
  await driveRequest(`${DRIVE_API}/files/${fileId}?${params}`, accessToken, { method: "PATCH" });
}

export async function disconnectGoogleDrive() {
  await prisma.googleDriveConnection.deleteMany();
}
