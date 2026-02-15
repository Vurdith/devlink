import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // NOTE: ESLint config moved to eslint.config.mjs in Next.js 16
  // Run `npm run lint` to see full list of issues to fix.
  reactStrictMode: true,
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: [
      'framer-motion', 
      'recharts', 
      'date-fns', 
      'emoji-picker-react',
      '@sentry/nextjs',
      'lucide-react',
      '@prisma/client',
      'clsx',
      'tailwind-merge',
    ],
    // Enable server actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Turbopack optimizations (moved from experimental.turbo)
  turbopack: {
    // Keep Turbopack scoped to this project directory.
    root: process.cwd(),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // Cloudflare tunnel for dev/testing
      {
        protocol: 'https',
        hostname: '*.trycloudflare.com',
        pathname: '/uploads/**',
      },
      // Cloudflare R2 storage
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // Cloudflare R2 public buckets
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      // Custom R2 CDN domain (production)
      {
        protocol: 'https',
        hostname: 'cdn.devlink.ink',
      },
      // AWS S3 buckets
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      // CloudFront CDN
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      // OAuth Provider Profile Images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Google (all subdomains)
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Twitter/X
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com', // Facebook
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net', // Facebook CDN
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    // CORS: Restrict to specific origins in production for security
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS || 'https://devlink.ink'
      : '*'; // Allow all in development for tunnel testing

    // Comprehensive Content Security Policy (defense-in-depth, mirrors src/proxy.ts)
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

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // Security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Only disable cache for mutation endpoints
        source: '/api/(auth|upload|posts|likes|reposts|save|follow|polls)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache read-only API endpoints
        source: '/api/(user|hashtag|search|discover)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=10, stale-while-revalidate=30',
          },
        ],
      },
      {
        // Static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotate React components for better component names
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Disable the automatic instrumentation of the Vercel Cron
  automaticVercelMonitors: false,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
