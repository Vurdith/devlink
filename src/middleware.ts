import { NextRequest, NextResponse } from "next/server";

const SITE_LOCK_COOKIE = "devlink_site_lock";
const SITE_LOCK_ROUTE = "/site-lock";
const SITE_LOCK_API_ROUTE = "/api/site-lock";

function isSiteLockEnabled() {
  return process.env.SITE_LOCK_ENABLED === "true";
}

function isPublicPath(pathname: string) {
  return pathname === SITE_LOCK_ROUTE || pathname.startsWith(SITE_LOCK_API_ROUTE);
}

export function middleware(request: NextRequest) {
  if (!isSiteLockEnabled()) {
    return NextResponse.next();
  }

  const expectedPassword = process.env.SITE_LOCK_PASSWORD;
  if (!expectedPassword) {
    // Fail open if password isn't configured to avoid accidental lockout.
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const grantedCookie = request.cookies.get(SITE_LOCK_COOKIE)?.value;
  if (grantedCookie === expectedPassword) {
    return NextResponse.next();
  }

  const lockUrl = request.nextUrl.clone();
  lockUrl.pathname = SITE_LOCK_ROUTE;
  lockUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(lockUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
