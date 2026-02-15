import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { uploadFile } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Authentication check - REQUIRED for uploads
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 20 uploads per minute per user
    const rateLimit = await checkRateLimit(`upload:${session.user.id}`, 20, 60);
    if (!rateLimit.success) {
      return NextResponse.json({ 
        error: "Too many uploads. Please wait before uploading again." 
      }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    
    // Support both images and videos
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video uploads allowed" }, { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Server-side magic byte validation to prevent spoofed MIME types
    const { fileTypeFromBuffer } = await import('file-type');
    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = await fileTypeFromBuffer(new Uint8Array(buffer));
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];
    // Only block when detectedType exists AND is not in the allowlist
    // (SVG files won't be detected by file-type since they're XML-based)
    if (detectedType && !ALLOWED_MIMES.includes(detectedType.mime)) {
      return NextResponse.json({ error: "Invalid file type detected" }, { status: 400 });
    }

    // Use the abstracted upload function (S3 or Local)
    const { url } = await uploadFile(file);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
