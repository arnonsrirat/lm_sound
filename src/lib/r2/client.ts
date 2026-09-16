import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && process.env.R2_BUCKET_NAME);
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "https://invalid-r2.local",
  credentials: {
    accessKeyId: accessKeyId || "missing",
    secretAccessKey: secretAccessKey || "missing",
  },
});

export function getR2Bucket() {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
  return bucket;
}

export function getR2PublicUrl(key: string) {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return publicUrl ? `${publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}` : `/api/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
}
