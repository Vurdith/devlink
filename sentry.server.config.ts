// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";
const debugEnabled = process.env.SENTRY_DEBUG === "true";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring - reduced in dev to avoid log spam
  tracesSampleRate: isDev ? 0 : 1.0,
  
  // Profile 10% of transactions for deep performance insights (prod only)
  profilesSampleRate: isDev ? 0 : 0.1,

  // Set the environment
  environment: process.env.NODE_ENV,

  // NEVER enable debug in dev - causes massive log spam
  debug: false,

  // Capture unhandled promise rejections with detailed context
  integrations: isDev ? [] : [
    Sentry.prismaIntegration(), // Track Prisma queries with timing (prod only)
  ],

  // Filter error events
  beforeSend(event) {
    // In dev, only send if debug is enabled
    if (isDev && !debugEnabled) {
      console.log("[Sentry Server] Event captured (dev mode - not sent):", 
        event.message || event.exception?.values?.[0]?.value);
      return null;
    }
    return event;
  },

  // IMPORTANT: Always send performance transactions in debug mode
  beforeSendTransaction(transaction) {
    // In dev without debug, still log but don't send
    if (isDev && !debugEnabled) {
      const duration = transaction.timestamp && transaction.start_timestamp
        ? (transaction.timestamp - transaction.start_timestamp) * 1000
        : 0;
      console.log(`[Sentry Perf] ${transaction.transaction}: ${duration.toFixed(0)}ms`);
      return null;
    }
    return transaction;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Common non-actionable errors
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
  ],
});

