import { HeadObjectCommand, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2PublicUrl, r2 } from "./client";

export async function createR2PresignedPut(key: string, contentType: string, expiresIn = 300) {
  const command = new PutObjectCommand({ Bucket: getR2Bucket(), Key: key, ContentType: contentType });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function headR2Object(key: string) {
  return r2.send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }));
}

export async function deleteR2Object(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }));
}

export async function moveR2Object(sourceKey: string, targetKey: string) {
  await r2.send(new CopyObjectCommand({ Bucket: getR2Bucket(), Key: targetKey, CopySource: `${getR2Bucket()}/${sourceKey}` }));
  await deleteR2Object(sourceKey);
}

export async function getR2Object(key: string) {
  return r2.send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }));
}

export { getR2PublicUrl };
