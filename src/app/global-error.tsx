"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          
          <p className="text-gray-400 mb-6">
            We&apos;ve been notified and are working to fix this issue.
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-[var(--color-accent-hover)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = "/"}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}





