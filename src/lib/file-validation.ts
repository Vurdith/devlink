const FILE_SIGNATURES: Record<string, Buffer> = {
  "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
  "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  "image/gif": Buffer.from([0x47, 0x49, 0x46, 0x38]),
  "image/webp": Buffer.from([0x52, 0x49, 0x46, 0x46]),
  "video/mp4": Buffer.from([0x00, 0x00, 0x00]),
  "video/webm": Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function validateFileType(buffer: Buffer, declaredType: string): { valid: boolean; detectedType?: string } {
  const header = buffer.slice(0, 12);

  for (const [mimeType, signature] of Object.entries(FILE_SIGNATURES)) {
    if (header.includes(signature)) {
      if (mimeType === declaredType || mimeType.split("/")[0] === declaredType.split("/")[0]) {
        return { valid: true, detectedType: mimeType };
      }
      return { valid: false, detectedType: mimeType };
    }
  }

  if (declaredType.startsWith("image/") || declaredType.startsWith("video/")) {
    return { valid: false };
  }

  return { valid: true, detectedType: declaredType };
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }
  return { valid: true };
}

export function validateFilename(filename: string): { valid: boolean; error?: string } {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  
  if (sanitized.length === 0) {
    return { valid: false, error: "Invalid filename" };
  }
  
  if (sanitized.length > 255) {
    return { valid: false, error: "Filename too long" };
  }
  
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".js", ".jar"];
  const ext = sanitized.toLowerCase().slice(sanitized.lastIndexOf("."));
  
  if (dangerousExtensions.includes(ext)) {
    return { valid: false, error: "File type not allowed" };
  }
  
  return { valid: true };
}

export async function validateUpload(
  file: File,
  buffer: Buffer
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error!);
  }

  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.valid) {
    errors.push(filenameValidation.error!);
  }

  const typeValidation = validateFileType(buffer, file.type);
  if (!typeValidation.valid) {
    if (typeValidation.detectedType) {
      errors.push(`File type mismatch: declared ${file.type}, detected ${typeValidation.detectedType}`);
    } else {
      errors.push("Could not verify file type");
    }
  }

  return { valid: errors.length === 0, errors };
}
