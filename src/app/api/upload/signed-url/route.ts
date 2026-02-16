import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSignedUploadUrl } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`upload_signed:${session.user.id}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await req.json()) as {
    filename?: string;
    contentType?: string;
  };

  if (!body.filename || !body.contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  if (!body.contentType.startsWith("image/") && !body.contentType.startsWith("video/")) {
    return NextResponse.json({ error: "Only image and video uploads are allowed" }, { status: 400 });
  }

  try {
    const signed = await createSignedUploadUrl({
      filename: body.filename,
      contentType: body.contentType,
    });
    return NextResponse.json(signed);
  } catch (error) {
    console.error("Failed to create signed upload URL:", error);
    return NextResponse.json(
      { error: "Signed uploads are not configured" },
      { status: 503 }
    );
  }
}
