import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name || "file";
  const ext = (originalName.split(".").pop() || "bin").toLowerCase();
  const filename = `${randomUUID()}.${ext}`;
  
  // S3 / R2 Upload
  if (s3Client) {
    try {
      const key = `uploads/${filename}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // Warning: Adjust based on bucket policy
      }));

      // If a custom public URL base is set (e.g. Cloudflare CDN), use it.
      // Otherwise, construct standard S3 URL (this might vary by provider).
      const url = PUBLIC_URL_BASE 
        ? `${PUBLIC_URL_BASE}/${key}`
        : `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

      return { url, key };
    } catch (error) {
      console.error("S3 Upload Error:", error);
      throw new Error("Failed to upload to cloud storage");
    }
  }

  // Fallback: Local Storage (Only for dev/testing)
  if (process.env.NODE_ENV === "production") {
    console.warn("WARNING: Using local storage in production. Set S3_ variables to enable cloud storage.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  
  await writeFile(filepath, buffer);
  
  return { 
    url: `/uploads/${filename}`,
    key: filename
  };
}

export async function createSignedUploadUrl(params: {
  filename: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  if (!s3Client) {
    throw new Error("Signed URLs require S3-compatible storage configuration.");
  }

  const ext = (params.filename.split(".").pop() || "bin").toLowerCase();
  const key = `uploads/${randomUUID()}.${ext}`;
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


