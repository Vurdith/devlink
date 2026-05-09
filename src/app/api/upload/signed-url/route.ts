import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";
import { parseJsonObjectBody } from "@/lib/api-utils";
import {
  isAllowedUploadMimeType,
  validateUploadContentType,
  validateUploadFilename,
  validateUploadSize,
} from "@/lib/file-validation";
import { createSignedUploadUrl } from "@/server/storage";

type SignedUploadRequestBody = {
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
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

  const parsedBody = await parseJsonObjectBody<SignedUploadRequestBody>(req, {
    invalidJsonMessage: "Request body must be valid JSON.",
    nonObjectMessage: "Request body must be a JSON object.",
  });
  if (!parsedBody.ok) {
    return parsedBody.response;
  }
  const body = parsedBody.data;

  if (typeof body.filename !== "string" || typeof body.contentType !== "string") {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  const filename = body.filename;
  const contentType = body.contentType;

  const filenameError = validateUploadFilename(filename);
  if (filenameError) {
    return NextResponse.json({ error: filenameError }, { status: 400 });
  }

  const contentTypeError = validateUploadContentType(contentType);
  if (contentTypeError) {
    return NextResponse.json({ error: contentTypeError }, { status: 400 });
  }

  if (body.size !== undefined) {
    const sizeError =
      typeof body.size === "number" ? validateUploadSize(body.size) : "File size must be a number.";
    if (sizeError) {
      return NextResponse.json({ error: sizeError }, { status: 400 });
    }
  }

  if (!isAllowedUploadMimeType(contentType)) {
    return NextResponse.json({ error: "Unsupported upload content type." }, { status: 400 });
  }

  try {
    const signed = await createSignedUploadUrl({
      filename,
      contentType,
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
