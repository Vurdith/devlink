// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring - disabled in dev to reduce noise
  tracesSampleRate: isDev ? 0 : 1.0,

  // Session Replay - prod only
  replaysSessionSampleRate: isDev ? 0 : 0.1,
  replaysOnErrorSampleRate: isDev ? 0 : 1.0,

  // Set the environment
  environment: process.env.NODE_ENV,

  // Disable debug mode to prevent log spam
  debug: false,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text for privacy (optional)
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out common noise
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      console.log("[Sentry] Event captured (dev mode - not sent):", event.message || event.exception?.values?.[0]?.value);
      return null;
    }
    return event;
  },

  // Ignore common errors that aren't actionable
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//i,
    // Network errors
    "NetworkError",
    "Failed to fetch",
    "Load failed",
    // User abort
    "AbortError",
    // ResizeObserver (common React issue)
    "ResizeObserver loop limit exceeded",
  ],
});





