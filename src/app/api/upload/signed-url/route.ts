import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";
import {
  isAllowedUploadMimeType,
  validateUploadContentType,
  validateUploadFilename,
  validateUploadSize,
} from "@/lib/file-validation";
import { createSignedUploadUrl } from "@/server/storage";

type SignedUploadRequestBody = {
  filename?: string;
  contentType?: string;
  size?: number;
};

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`upload_signed:${session.user.id}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many signed upload requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  let body: SignedUploadRequestBody;

  try {
    body = (await req.json()) as SignedUploadRequestBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  if (!body.filename || !body.contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  const filenameError = validateUploadFilename(body.filename);
  if (filenameError) {
    return NextResponse.json({ error: filenameError }, { status: 400 });
  }

  const contentTypeError = validateUploadContentType(body.contentType);
  if (contentTypeError) {
    return NextResponse.json({ error: contentTypeError }, { status: 400 });
  }

  if (body.size !== undefined) {
    const sizeError = validateUploadSize(body.size);
    if (sizeError) {
      return NextResponse.json({ error: sizeError }, { status: 400 });
    }
  }

  if (!isAllowedUploadMimeType(body.contentType)) {
    return NextResponse.json({ error: "Unsupported upload content type." }, { status: 400 });
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
