import { fileTypeFromBuffer } from "file-type";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
] as const;

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export type UploadValidationResult =
  | {
      valid: true;
      buffer: Buffer;
      contentType: AllowedUploadMimeType;
      extension: string;
    }
  | {
      valid: false;
      status: number;
      error: string;
    };

const MIME_EXTENSION_MAP: Record<AllowedUploadMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const DANGEROUS_FILENAME_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "scr",
  "sh",
  "ps1",
  "js",
  "mjs",
  "jar",
]);

export function isAllowedUploadMimeType(
  contentType: string | undefined
): contentType is AllowedUploadMimeType {
  return ALLOWED_UPLOAD_MIME_TYPES.includes(contentType as AllowedUploadMimeType);
}

export function getUploadExtension(contentType: AllowedUploadMimeType): string {
  return MIME_EXTENSION_MAP[contentType];
}

export function validateUploadSize(size: number): string | null {
  if (!Number.isFinite(size) || size <= 0) {
    return "Choose a non-empty file to upload.";
  }

  if (size > MAX_UPLOAD_SIZE_BYTES) {
    return "Files must be 5MB or smaller.";
  }

  return null;
}

export function validateUploadFilename(filename: string | undefined): string | null {
  const trimmed = filename?.trim() ?? "";

  if (!trimmed) {
    return "File name is required.";
  }

  if (trimmed.length > 255) {
    return "File name must be 255 characters or fewer.";
  }

  if (/[\\/]/.test(trimmed)) {
    return "File name cannot contain path separators.";
  }

  const extension = getFilenameExtension(trimmed);
  if (extension && DANGEROUS_FILENAME_EXTENSIONS.has(extension)) {
    return "That file extension is not allowed.";
  }

  return null;
}

export function validateUploadContentType(contentType: string | undefined): string | null {
  if (!contentType) {
    return "File content type is required.";
  }

  if (!isAllowedUploadMimeType(contentType)) {
    return "Upload an image or video file in JPG, PNG, GIF, WebP, SVG, MP4, or WebM format.";
  }

  return null;
}

export async function validateUploadFile(file: File): Promise<UploadValidationResult> {
  const filenameError = validateUploadFilename(file.name);
  if (filenameError) {
    return { valid: false, status: 400, error: filenameError };
  }

  const sizeError = validateUploadSize(file.size);
  if (sizeError) {
    return { valid: false, status: 400, error: sizeError };
  }

  const contentTypeError = validateUploadContentType(file.type);
  if (contentTypeError) {
    return { valid: false, status: 400, error: contentTypeError };
  }

  if (!isAllowedUploadMimeType(file.type)) {
    return {
      valid: false,
      status: 400,
      error: "Unsupported upload content type.",
    };
  }

  const contentType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = await fileTypeFromBuffer(new Uint8Array(buffer));

  if (contentType === "image/svg+xml") {
    if (!looksLikeSvg(buffer)) {
      return {
        valid: false,
        status: 400,
        error: "SVG uploads must contain SVG markup.",
      };
    }

    return {
      valid: true,
      buffer,
      contentType,
      extension: getUploadExtension(contentType),
    };
  }

  if (!detectedType) {
    return {
      valid: false,
      status: 400,
      error: "Could not verify the uploaded file type.",
    };
  }

  if (detectedType.mime !== contentType) {
    return {
      valid: false,
      status: 400,
      error: `File type mismatch: uploaded as ${contentType}, detected ${detectedTypeLabel(detectedType.mime)}.`,
    };
  }

  return {
    valid: true,
    buffer,
    contentType,
    extension: getUploadExtension(contentType),
  };
}

function getFilenameExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return "";
  }

  return filename.slice(lastDot + 1).toLowerCase();
}

function looksLikeSvg(buffer: Buffer): boolean {
  const text = buffer.toString("utf8", 0, Math.min(buffer.length, 512)).trimStart();
  return text.startsWith("<svg") || (text.startsWith("<?xml") && text.includes("<svg"));
}

function detectedTypeLabel(mimeType: string): string {
  return isAllowedUploadMimeType(mimeType) ? mimeType : "an unsupported file type";
}
