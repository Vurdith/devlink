/**
 * Performance utilities for common optimization patterns.
 */

/**
 * Debounce function with leading edge option.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId === null && options.leading) {
      fn(...args);
    }

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (!options.leading && lastArgs) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };
}

/**
 * Throttle function using requestAnimationFrame for smooth animations.
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
        }
        rafId = null;
      });
    }
  };
}

/**
 * Run a function when the browser is idle.
 */
export function runOnIdle(fn: () => void, timeout = 2000): void {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 100);
  }
}

/**
 * Preload an image to avoid layout shift.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch DOM reads and writes to avoid layout thrashing.
 */
class DOMBatcher {
  private reads: (() => void)[] = [];
  private writes: (() => void)[] = [];
  private scheduled = false;

  read(fn: () => void): void {
    this.reads.push(fn);
    this.schedule();
  }

  write(fn: () => void): void {
    this.writes.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      const reads = this.reads;
      this.reads = [];
      reads.forEach((fn) => fn());

      // Then execute all writes
      const writes = this.writes;
      this.writes = [];
      writes.forEach((fn) => fn());

      this.scheduled = false;
    });
  }
}

export const domBatcher = new DOMBatcher();

/**
 * Check if the user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get a stable hash for cache keys.
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Measure function execution time.
 */
export function measureTime<T>(name: string, fn: () => T): T {
  if (process.env.NODE_ENV !== "development") {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 16) {
    // More than one frame (60fps)
    console.warn(`[Perf] ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}


