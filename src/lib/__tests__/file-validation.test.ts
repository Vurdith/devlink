import { describe, expect, it } from "vitest";
import {
  getUploadExtension,
  validateUploadContentType,
  validateUploadFile,
  validateUploadFilename,
  validateUploadSize,
} from "../file-validation";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

describe("upload file validation", () => {
  it("accepts a PNG with matching bytes and content type", async () => {
    const file = new File([TINY_PNG], "avatar.png", { type: "image/png" });

    const result = await validateUploadFile(file);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.contentType).toBe("image/png");
      expect(result.extension).toBe("png");
    }
  });

  it("rejects mismatched file bytes", async () => {
    const file = new File([TINY_PNG], "clip.mp4", { type: "video/mp4" });

    const result = await validateUploadFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("File type mismatch");
    }
  });

  it("uses trusted content type for upload extensions", () => {
    expect(getUploadExtension("image/jpeg")).toBe("jpg");
    expect(getUploadExtension("video/webm")).toBe("webm");
  });

  it("rejects oversized and empty files", () => {
    expect(validateUploadSize(0)).toBe("Choose a non-empty file to upload.");
    expect(validateUploadSize(5 * 1024 * 1024 + 1)).toBe("Files must be 5MB or smaller.");
  });

  it("rejects path-like and executable filenames", () => {
    expect(validateUploadFilename("../avatar.png")).toBe("File name cannot contain path separators.");
    expect(validateUploadFilename("setup.exe")).toBe("That file extension is not allowed.");
  });

  it("keeps signed uploads on the same MIME allowlist", () => {
    expect(validateUploadContentType("image/webp")).toBeNull();
    expect(validateUploadContentType("application/pdf")).toContain("Upload an image or video file");
  });
});
