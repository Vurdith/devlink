import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { validateUploadFile } from "@/lib/file-validation";
import { uploadBuffer } from "@/server/storage";
import { checkRateLimit } from "@/server/rate-limit";
import { processMediaWithRust } from "@/server/services/hotpath-client";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`upload:${session.user.id}`, 20, 60);
    if (!rateLimit.success) {
      return NextResponse.json({ 
        error: "Too many uploads. Please wait before uploading again." 
      }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const validation = await validateUploadFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { url } = await uploadBuffer({
      buffer: validation.buffer,
      contentType: validation.contentType,
    });
    await processMediaWithRust({
      mediaId: crypto.randomUUID(),
      mediaType: validation.contentType.startsWith("video/") ? "video" : "image",
      url,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
