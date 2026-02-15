import { NextRequest, NextResponse } from "next/server";

const SITE_LOCK_COOKIE = "devlink_site_lock";
const SITE_LOCK_ROUTE = "/site-lock";

function sanitizeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/"));
  const expectedPassword = process.env.SITE_LOCK_PASSWORD;

  if (!expectedPassword) {
    const fallbackUrl = new URL(nextPath, request.url);
    return NextResponse.redirect(fallbackUrl);
  }

  if (password !== expectedPassword) {
    const errorUrl = new URL(SITE_LOCK_ROUTE, request.url);
    errorUrl.searchParams.set("error", "1");
    errorUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(errorUrl);
  }

  const redirectUrl = new URL(nextPath, request.url);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set({
    name: SITE_LOCK_COOKIE,
    value: expectedPassword,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
