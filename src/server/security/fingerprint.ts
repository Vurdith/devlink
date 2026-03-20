import crypto from "crypto";
import type { NextRequest } from "next/server";

export function deriveDeviceFingerprint(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-ua";
  const acceptLang = request.headers.get("accept-language") ?? "unknown-lang";
  const acceptEncoding = request.headers.get("accept-encoding") ?? "unknown-enc";
  const source = `${ip}|${userAgent}|${acceptLang}|${acceptEncoding}`;
  return crypto.createHash("sha256").update(source).digest("hex");
}
