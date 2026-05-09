import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deriveDeviceFingerprint } from "@/server/security/fingerprint";

/**
 * Global proxy for security headers and basic protection
 * Runs on all routes except static files
 * (Renamed from middleware to proxy in Next.js 16)
 */
export function proxy(req: NextRequest) {
  const response = NextResponse.next();
  
  // Dynamic CORS origin checking
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://devlink.ink').split(',');
  const origin = req.headers.get('origin');
  
  if (process.env.NODE_ENV === 'development') {
    // Allow all origins in development for tunnel testing
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  } else {
    // In production, only allow whitelisted origins
    const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Comprehensive Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.devlink.ink",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http://localhost:*",
    "media-src 'self' blob: https: http://localhost:*",
    "connect-src 'self' https://*.supabase.co https://cdn.devlink.ink wss://*.supabase.co https://*.sentry.io",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // Add request ID for debugging/tracing
  const requestId = crypto.randomUUID();
  const fingerprint = deriveDeviceFingerprint(req);
  response.headers.set('X-Request-ID', requestId);
  response.headers.set("X-Device-Fingerprint", fingerprint);

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
