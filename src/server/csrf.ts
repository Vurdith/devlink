import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return true;
  }

  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
}

export function requireCsrf(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const valid = await validateCsrfToken(request);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid CSRF token", code: "CSRF_ERROR" },
        { status: 403 }
      );
    }
    return handler(request);
  };
}

export const CSRF_SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function shouldCheckCsrf(request: NextRequest): boolean {
  return !CSRF_SAFE_METHODS.includes(request.method);
}
