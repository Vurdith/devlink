import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts', 'date-fns', 'emoji-picker-react'],
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
    return [
      {
        source: '/(.*)',
        headers: [
          // RESTORED: CORS headers are necessary for the Cloudflare tunnel and local dev to work correctly
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // Removed X-Content-Type-Options: nosniff as it can break style loading in some dev environments
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

export default nextConfig;
