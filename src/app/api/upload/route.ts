import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { uploadFile } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Authentication check - REQUIRED for uploads
    const session = await getServerSession(authOptions);
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

    // Use the abstracted upload function (S3 or Local)
    const { url } = await uploadFile(file);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
