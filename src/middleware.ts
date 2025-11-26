import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global middleware for security headers and basic protection
 * Runs on all routes except static files
 */
export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Prevent clickjacking with CSP frame-ancestors
  // Note: This is in addition to X-Frame-Options for modern browsers
  const csp = "frame-ancestors 'self';";
  response.headers.set('Content-Security-Policy', csp);

  // Add request ID for debugging/tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - uploads (user uploads)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
