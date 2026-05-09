import crypto from "crypto";
import type { NextRequest } from "next/server";

const UNKNOWN_IP = "unknown-ip";
const UNKNOWN_USER_AGENT = "unknown-ua";
const UNKNOWN_LANGUAGE = "unknown-lang";
const UNKNOWN_ENCODING = "unknown-enc";

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export function getClientIp(request: NextRequest): string {
  return (
    firstHeaderValue(request.headers.get("x-forwarded-for")) ??
    request.headers.get("x-real-ip") ??
    UNKNOWN_IP
  );
}

export function deriveDeviceFingerprint(request: NextRequest): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? UNKNOWN_USER_AGENT;
  const acceptLang = request.headers.get("accept-language") ?? UNKNOWN_LANGUAGE;
  const acceptEncoding =
    request.headers.get("accept-encoding") ?? UNKNOWN_ENCODING;
  const source = `${ip}|${userAgent}|${acceptLang}|${acceptEncoding}`;
  return crypto.createHash("sha256").update(source).digest("hex");
}
