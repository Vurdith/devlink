"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
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
      <body className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] p-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 gradient-bg opacity-30" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.08]" />

        <div className={surface("panelStrong", "noise-overlay relative w-full max-w-md overflow-hidden p-6 text-center sm:p-8")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />
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

          <h2 className="mb-2 font-[var(--font-space-grotesk)] text-2xl font-bold tracking-normal text-white">
            Something went wrong
          </h2>
          
          <p className="mb-6 text-sm leading-relaxed text-white/58">
            We&apos;ve been notified and are working to fix this issue.
          </p>

          {error.digest && (
            <p className="mb-6 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 font-mono text-xs text-white/45">
              Error ID: {error.digest}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => reset()}
              variant="gradient"
              className="w-full"
            >
            Try again
            </Button>
            
            <Button
              onClick={() => window.location.href = "/"}
              variant="secondary"
              className="w-full"
            >
            Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}





