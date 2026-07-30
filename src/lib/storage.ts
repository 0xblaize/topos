import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return undefined;
  return new S3Client({ region: "auto", endpoint, credentials: { accessKeyId, secretAccessKey } });
}

function getBucket() {
  return process.env.R2_BUCKET;
}

export function storageConfigured() {
  return Boolean(getClient() && getBucket());
}

export async function putDataUrl(key: string, dataUrl: string) {
  const client = getClient();
  const bucket = getBucket();
  if (!client || !bucket) return undefined;
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) throw new Error("Unsupported image data");
  const [, contentType, encoded] = match;
  const body = Buffer.from(encoded, "base64");
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "private, max-age=31536000, immutable" }));
  return { key, contentType, byteSize: body.byteLength };
}

export async function signedAssetUrl(key: string) {
  const client = getClient();
  const bucket = getBucket();
  if (!client || !bucket) return undefined;
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
}

export async function deleteAsset(key: string) {
  const client = getClient();
  const bucket = getBucket();
  if (!client || !bucket) return;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
