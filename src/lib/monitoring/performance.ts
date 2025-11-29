/**
 * DevLink Performance Monitoring System
 * 
 * Comprehensive performance tracking integrated with Sentry for
 * world-class observability and optimization insights.
 */

import * as Sentry from "@sentry/nextjs";

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceMetrics {
  // Timing metrics
  duration: number;
  
  // Optional breakdown
  dbTime?: number;
  cacheTime?: number;
  computeTime?: number;
  networkTime?: number;
  
  // Metadata
  success: boolean;
  cached?: boolean;
  itemCount?: number;
  
  // Custom data
  metadata?: Record<string, string | number | boolean>;
}

export interface SpanOptions {
  name: string;
  op: string;
  description?: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// PERFORMANCE SPANS - Wrap any operation with detailed tracing
// ============================================================================

/**
 * Wrap an async operation with Sentry performance tracking
 * 
 * @example
 * const result = await withSpan(
 *   { name: 'fetch-feed', op: 'db.query' },
 *   async (span) => {
 *     const posts = await prisma.post.findMany();
 *     span?.setData('post_count', posts.length);
 *     return posts;
 *   }
 * );
 */
export async function withSpan<T>(
  options: SpanOptions,
  operation: (span: Sentry.Span | undefined) => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name: options.name,
      op: options.op,
      attributes: options.data as Record<string, string | number | boolean | undefined>,
    },
    async (span) => {
      try {
        const result = await operation(span);
        span?.setStatus({ code: 1 }); // OK
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: String(error) }); // ERROR
        throw error;
      }
    }
  );
}

/**
 * Wrap a sync operation with Sentry performance tracking
 */
export function withSpanSync<T>(
  options: SpanOptions,
  operation: (span: Sentry.Span | undefined) => T
): T {
  return Sentry.startSpanManual(
    {
      name: options.name,
      op: options.op,
      attributes: options.data as Record<string, string | number | boolean | undefined>,
    },
    (span) => {
      try {
        const result = operation(span);
        span?.setStatus({ code: 1 });
        span?.end();
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: String(error) });
        span?.end();
        throw error;
      }
    }
  );
}

// ============================================================================
// SPECIALIZED TRACKERS - Pre-configured spans for common operations
// ============================================================================

export const perf = {
  /**
   * Track database operations
   */
  async db<T>(
    queryName: string,
    operation: (span: Sentry.Span | undefined) => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    return withSpan(
      {
        name: queryName,
        op: "db.prisma",
        description: `Database: ${queryName}`,
        data: metadata,
      },
      operation
    );
  },

  /**
   * Track cache operations
   */
  async cache<T>(
    action: "get" | "set" | "delete",
    key: string,
    operation: (span: Sentry.Span | undefined) => Promise<T>
  ): Promise<T> {
    return withSpan(
      {
        name: `cache.${action}`,
        op: "cache",
        description: `Cache ${action}: ${key}`,
        data: { key, action },
      },
      operation
    );
  },

  /**
   * Track algorithm/computation operations
   */
  async compute<T>(
    name: string,
    operation: (span: Sentry.Span | undefined) => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    return withSpan(
      {
        name,
        op: "function",
        description: `Compute: ${name}`,
        data: metadata,
      },
      operation
    );
  },

  /**
   * Track external API calls
   */
  async external<T>(
    service: string,
    endpoint: string,
    operation: (span: Sentry.Span | undefined) => Promise<T>
  ): Promise<T> {
    return withSpan(
      {
        name: `${service}.${endpoint}`,
        op: "http.client",
        description: `External: ${service}/${endpoint}`,
        data: { service, endpoint },
      },
      operation
    );
  },

  /**
   * Track rendering operations (for SSR)
   */
  async render<T>(
    componentName: string,
    operation: (span: Sentry.Span | undefined) => Promise<T>
  ): Promise<T> {
    return withSpan(
      {
        name: `render.${componentName}`,
        op: "ui.render",
        description: `Render: ${componentName}`,
      },
      operation
    );
  },
};

// ============================================================================
// CUSTOM METRICS - Business & Performance KPIs
// ============================================================================

export const metrics = {
  /**
   * Record a timing metric
   */
  timing(name: string, durationMs: number, tags?: Record<string, string>) {
    Sentry.setMeasurement(name, durationMs, "millisecond");
    
    // Also set as span attribute if in a transaction
    Sentry.getCurrentScope().setExtra(`metric.${name}`, {
      value: durationMs,
      unit: "ms",
      tags,
    });
  },

  /**
   * Record a count metric
   */
  count(name: string, value: number, tags?: Record<string, string>) {
    Sentry.setMeasurement(name, value, "none");
    
    Sentry.getCurrentScope().setExtra(`metric.${name}`, {
      value,
      unit: "count",
      tags,
    });
  },

  /**
   * Record a gauge metric (current value)
   */
  gauge(name: string, value: number, unit: string = "none") {
    Sentry.setMeasurement(name, value, unit as "none" | "millisecond" | "second" | "byte" | "kilobyte" | "megabyte" | "percent");
  },

  // Pre-defined business metrics
  feedLoad: (duration: number, postCount: number, cached: boolean) => {
    metrics.timing("feed.load_time", duration);
    metrics.count("feed.post_count", postCount);
    metrics.gauge("feed.cached", cached ? 1 : 0);
  },

  rankingScore: (duration: number, postCount: number) => {
    metrics.timing("ranking.compute_time", duration);
    metrics.count("ranking.posts_scored", postCount);
  },

  cacheHit: (cacheType: string, hit: boolean) => {
    const metricName = `cache.${cacheType}.${hit ? "hit" : "miss"}`;
    metrics.count(metricName, 1);
  },

  apiLatency: (endpoint: string, duration: number, status: number) => {
    metrics.timing(`api.${endpoint}.latency`, duration);
    if (status >= 400) {
      metrics.count(`api.${endpoint}.errors`, 1);
    }
  },

  dbQuery: (queryType: string, duration: number, rowCount: number) => {
    metrics.timing(`db.${queryType}.duration`, duration);
    metrics.count(`db.${queryType}.rows`, rowCount);
  },
};

// ============================================================================
// PERFORMANCE PROFILING - Detailed operation breakdown
// ============================================================================

export class PerformanceProfiler {
  private startTime: number;
  private marks: Map<string, number> = new Map();
  private spans: Map<string, { start: number; end?: number }> = new Map();
  private operationName: string;

  constructor(operationName: string) {
    this.operationName = operationName;
    this.startTime = performance.now();
  }

  /**
   * Mark a point in time
   */
  mark(name: string) {
    this.marks.set(name, performance.now() - this.startTime);
  }

  /**
   * Start a named span
   */
  startSpan(name: string) {
    this.spans.set(name, { start: performance.now() });
  }

  /**
   * End a named span
   */
  endSpan(name: string) {
    const span = this.spans.get(name);
    if (span) {
      span.end = performance.now();
    }
  }

  /**
   * Get the total duration so far
   */
  elapsed(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Complete profiling and send to Sentry
   */
  finish(): PerformanceMetrics {
    const totalDuration = performance.now() - this.startTime;
    
    // Calculate span durations
    const spanDurations: Record<string, number> = {};
    for (const [name, span] of this.spans) {
      if (span.end) {
        spanDurations[name] = span.end - span.start;
      }
    }

    // Send to Sentry as custom measurements
    Sentry.setMeasurement(`${this.operationName}.total`, totalDuration, "millisecond");
    
    for (const [name, duration] of Object.entries(spanDurations)) {
      Sentry.setMeasurement(`${this.operationName}.${name}`, duration, "millisecond");
    }

    // Log marks as context
    Sentry.getCurrentScope().setExtra(`profiler.${this.operationName}`, {
      total: totalDuration,
      marks: Object.fromEntries(this.marks),
      spans: spanDurations,
    });

    return {
      duration: totalDuration,
      success: true,
      metadata: {
        ...Object.fromEntries(this.marks),
        ...spanDurations,
      },
    };
  }
}

// ============================================================================
// ALERT THRESHOLDS - Define performance budgets
// ============================================================================

export const performanceBudgets = {
  // Page load budgets (ms)
  pages: {
    home: 500,
    feed: 800,
    profile: 600,
    discover: 700,
    search: 1000,
  },
  
  // API endpoint budgets (ms)
  api: {
    feed: 300,
    posts: 200,
    search: 500,
    user: 150,
    discover: 400,
  },
  
  // Database query budgets (ms)
  db: {
    simple: 50,
    complex: 200,
    aggregate: 500,
  },
  
  // Cache operation budgets (ms)
  cache: {
    get: 10,
    set: 20,
  },
};

/**
 * Check if an operation exceeded its budget and log a warning
 */
export function checkBudget(
  category: keyof typeof performanceBudgets,
  operation: string,
  actualMs: number
): boolean {
  const budgets = performanceBudgets[category] as Record<string, number>;
  const budget = budgets[operation];
  
  if (budget && actualMs > budget) {
    Sentry.addBreadcrumb({
      category: "performance",
      message: `Budget exceeded: ${category}.${operation}`,
      level: "warning",
      data: {
        budget,
        actual: actualMs,
        exceeded_by: actualMs - budget,
        exceeded_percent: Math.round(((actualMs - budget) / budget) * 100),
      },
    });
    
    // If way over budget, capture as an issue
    if (actualMs > budget * 2) {
      Sentry.captureMessage(
        `Performance: ${category}.${operation} took ${actualMs}ms (budget: ${budget}ms)`,
        "warning"
      );
    }
    
    return false;
  }
  
  return true;
}

// ============================================================================
// REQUEST CONTEXT - Track user context for performance analysis
// ============================================================================

export function setUserContext(userId?: string, metadata?: Record<string, string>) {
  if (userId) {
    Sentry.setUser({ id: userId, ...metadata });
  }
  
  // Set useful context for performance analysis
  Sentry.setContext("performance", {
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

export function setRequestContext(request: Request) {
  const url = new URL(request.url);
  
  Sentry.setContext("request", {
    method: request.method,
    path: url.pathname,
    query: url.search,
    userAgent: request.headers.get("user-agent") || "unknown",
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  withSpan,
  withSpanSync,
  perf,
  metrics,
  PerformanceProfiler,
  performanceBudgets,
  checkBudget,
  setUserContext,
  setRequestContext,
};

