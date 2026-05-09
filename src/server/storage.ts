import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  type AllowedUploadMimeType,
  getUploadExtension,
  isAllowedUploadMimeType,
} from "@/lib/file-validation";

// Initialize S3 Client if env vars are present
const s3Client = (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) 
  ? new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Needed for some S3 compatible providers like MinIO
    })
  : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "devlink-uploads";
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL || "";

interface UploadResult {
  url: string;
  key: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  if (!isAllowedUploadMimeType(file.type)) {
    throw new Error("Unsupported upload content type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBuffer({
    buffer,
    contentType: file.type,
  });
}

export async function uploadBuffer(params: {
  buffer: Buffer;
  contentType: AllowedUploadMimeType;
}): Promise<UploadResult> {
  const filename = `${randomUUID()}.${getUploadExtension(params.contentType)}`;

  if (s3Client) {
    try {
      const key = `uploads/${filename}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
        ACL: "public-read",
      }));

      const url = PUBLIC_URL_BASE 
        ? `${PUBLIC_URL_BASE}/${key}`
        : `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

      return { url, key };
    } catch (error) {
      console.error("S3 Upload Error:", error);
      throw new Error("Failed to upload to cloud storage");
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("Upload storage is falling back to local disk in production. Set S3_ variables to enable cloud storage.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  
  await writeFile(filepath, params.buffer);
  
  return { 
    url: `/uploads/${filename}`,
    key: filename
  };
}

export async function createSignedUploadUrl(params: {
  filename: string;
  contentType: AllowedUploadMimeType;
  expiresInSeconds?: number;
}) {
  if (!s3Client) {
    throw new Error("Signed URLs require S3-compatible storage configuration.");
  }

  const key = `uploads/${randomUUID()}.${getUploadExtension(params.contentType)}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: params.contentType,
    ACL: "public-read",
  });
  const expiresIn = Math.max(60, Math.min(params.expiresInSeconds ?? 600, 3600));
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const publicUrl = PUBLIC_URL_BASE
    ? `${PUBLIC_URL_BASE}/${key}`
    : `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
    expiresIn,
  };
}


