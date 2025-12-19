"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden">
          {/* Background effects matching the app theme */}
          <div className="absolute inset-0 gradient-bg opacity-30" />
          <div className="absolute inset-0 grid-pattern opacity-10" />
          
          <div className="relative z-10 glass-soft rounded-2xl p-8 max-w-md mx-4 text-center border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-6 border border-[var(--color-accent)]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Something went wrong</h2>
            <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the page.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={this.resetError}
                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 active:scale-95"
              >
                Refresh
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left group">
                <summary className="cursor-pointer text-xs text-[var(--muted-foreground)] hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  Technical Details
                </summary>
                <div className="mt-3 p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm overflow-hidden">
                  <pre className="text-[10px] text-[var(--color-accent)]/80 font-mono overflow-x-auto whitespace-pre-wrap max-h-[200px] scrollbar-hide">
                    {this.state.error.toString()}
                    {"\n\n"}
                    {this.state.error.stack}
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
