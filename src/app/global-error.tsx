"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { iconBox, surface } from "@/components/ui/design-system";

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
      <body className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className={surface("panelStrong", "w-full max-w-md p-8 text-center")}>
          <div className={iconBox("cyan", "mx-auto mb-6 h-16 w-16 rounded-xl")}>
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
          
          <p className="text-[var(--muted-foreground)] mb-6">
            We&apos;ve been notified and are working to fix this issue.
          </p>

          {error.digest && (
            <p className="text-xs text-white/45 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.32)] bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))] px-6 py-2.5 font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = "/"}
              className="rounded-lg border border-white/[0.10] bg-white/[0.055] px-6 py-2.5 font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.09]"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}





