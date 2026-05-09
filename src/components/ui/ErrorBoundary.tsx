"use client";

import React from 'react';
import { cn } from "@/lib/cn";
import { iconBox, surface, ui } from "./design-system";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

const CHUNK_RELOAD_KEY = "devlink:chunk-reload-attempted";

function isChunkLoadError(error: Error) {
  const message = `${error.name} ${error.message}`;
  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (typeof window === "undefined" || !isChunkLoadError(error)) return;

    try {
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") return;
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    } catch {
      // If sessionStorage is blocked, still try one hard reload.
    }

    window.location.reload();
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] p-4">
          <div aria-hidden="true" className="absolute inset-0 gradient-bg opacity-30" />
          <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-[0.08]" />
          
          <div className={surface("panel", "noise-overlay relative z-10 w-full max-w-md overflow-hidden bg-[rgba(12,16,23,0.84)] p-6 text-center sm:p-8")}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
            <div className={iconBox("cyan", "mx-auto mb-6 h-16 w-16 rounded-xl")}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="mb-3 font-[var(--font-space-grotesk)] text-2xl font-bold tracking-normal text-white">Something went wrong</h2>
            <p className="mb-8 text-sm leading-relaxed text-white/58">
              We encountered an unexpected error. Don&apos;t worry, your data is safe. Please try refreshing the page.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={this.resetError}
                className={cn("rounded-lg px-6 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.68)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]", ui.control.gradient, ui.motion.lift)}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn("rounded-lg px-6 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.56)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]", ui.control.ghost, ui.motion.lift)}
              >
                Refresh
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-8 text-left group">
                <summary className="cursor-pointer text-xs text-[var(--muted-foreground)] hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  Technical Details
                </summary>
                <div className={surface("panelMuted", "mt-3 overflow-hidden p-4")}>
                  <pre className="text-[10px] text-[var(--color-accent)]/80 font-mono overflow-x-auto whitespace-pre-wrap max-h-[200px] scrollbar-hide">
                    {process.env.NODE_ENV === 'development'
                      ? `${this.state.error.toString()}\n\n${this.state.error.stack ?? ""}`
                      : `${this.state.error.name}: ${this.state.error.message}`}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}
