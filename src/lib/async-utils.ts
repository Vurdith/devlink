/**
 * Async utilities for better error handling, timeouts, and logging
 */

import { TIME_CONSTRAINTS } from "@/lib/constants";

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Fetch with timeout protection to prevent hanging requests
 */
export async function fetchWithTimeout<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { timeout = 10000, retries = 0, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.error || response.statusText,
            statusCode: response.status,
          };
        } catch {
          return {
            success: false,
            error: response.statusText,
            statusCode: response.status,
          };
        }
      }

      const data = await response.json();
      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${timeout}ms`,
        };
      }

      // Only retry on network errors, not on abort
      if (attempt < retries && !(error instanceof Error && error.name === 'AbortError')) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      return {
        success: false,
        error: lastError.message || 'Failed to fetch',
      };
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Failed to fetch after retries',
  };
}

/**
 * Wrapper for async operations with better error handling
 */
export async function asyncWrapper<T>(
  asyncFn: () => Promise<T>,
  options: {
    onError?: (error: Error) => void;
    onSuccess?: (result: T) => void;
    context?: string;
  } = {}
): Promise<T | null> {
  try {
    const result = await asyncFn();
    options.onSuccess?.(result);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Error${options.context ? ` in ${options.context}` : ''}:`, err);
    options.onError?.(err);
    return null;
  }
}

/**
 * Create a debounced async function
 */
export function createDebouncedAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number = TIME_CONSTRAINTS.API_CALL_DEBOUNCE_MS
): {
  execute: (...args: T) => Promise<R | null>;
  cancel: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastPromise: Promise<R | null> | null = null;

  return {
    execute: (...args: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      lastPromise = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          fn(...args).then(resolve).catch(() => resolve(null));
          timeoutId = null;
        }, delay);
      });

      return lastPromise;
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}

/**
 * Retry mechanism for failed async operations
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  console.error('Max retries exceeded:', lastError);
  return null;
}

