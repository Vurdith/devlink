/**
 * API Performance Wrapper
 * 
 * Wraps API route handlers with comprehensive performance monitoring.
 * Use this to automatically track all API calls with Sentry.
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { metrics, checkBudget, setRequestContext } from "./performance";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

interface WrapOptions {
  /** Name of the endpoint for metrics */
  name: string;
  /** Performance budget in ms (default: 500) */
  budget?: number;
  /** Whether to track detailed database spans */
  trackDb?: boolean;
}

/**
 * Wrap an API route handler with performance monitoring
 * 
 * @example
 * export const GET = withMonitoring(
 *   { name: "feed", budget: 300 },
 *   async (request) => {
 *     const posts = await getFeed();
 *     return NextResponse.json(posts);
 *   }
 * );
 */
export function withMonitoring(
  options: WrapOptions,
  handler: RouteHandler
): RouteHandler {
  const { name, budget = 500 } = options;

  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const startTime = performance.now();
    
    // Set request context for Sentry
    setRequestContext(request);
    
    return Sentry.startSpan(
      {
        name: `API ${request.method} /${name}`,
        op: "http.server",
        attributes: {
          "http.method": request.method,
          "http.url": request.url,
          endpoint: name,
        },
      },
      async (span) => {
        try {
          // Execute the handler
          const response = await handler(request, context);
          
          const duration = performance.now() - startTime;
          const status = response.status;
          
          // Record metrics
          metrics.apiLatency(name, duration, status);
          
          // Check performance budget
          checkBudget("api", name, duration);
          
          // Set span data
          span?.setAttribute("http.status_code", status);
          span?.setAttribute("duration_ms", duration);
          
          // Add performance measurement
          Sentry.setMeasurement(`api.${name}.duration`, duration, "millisecond");
          
          // Log slow requests
          if (duration > budget) {
            Sentry.addBreadcrumb({
              category: "performance",
              message: `Slow API: ${name} took ${duration.toFixed(0)}ms (budget: ${budget}ms)`,
              level: "warning",
              data: { duration, budget, status },
            });
          }
          
          span?.setStatus({ code: status < 400 ? 1 : 2 });
          return response;
          
        } catch (error) {
          const duration = performance.now() - startTime;
          
          // Record error metrics
          metrics.apiLatency(name, duration, 500);
          metrics.count(`api.${name}.exceptions`, 1);
          
          // Capture exception
          Sentry.captureException(error, {
            extra: {
              endpoint: name,
              method: request.method,
              duration,
            },
          });
          
          span?.setStatus({ code: 2, message: String(error) });
          throw error;
        }
      }
    );
  };
}

/**
 * Create a cached version of an API handler
 * Tracks cache hit/miss rates
 */
export function withCache<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  cacheProvider: {
    get: (key: string) => Promise<T | null>;
    set: (key: string, value: T, ttl: number) => Promise<void>;
  }
): () => Promise<{ data: T; cached: boolean }> {
  return async () => {
    const cacheStart = performance.now();
    
    try {
      const cached = await cacheProvider.get(cacheKey);
      
      if (cached !== null) {
        const cacheTime = performance.now() - cacheStart;
        metrics.cacheHit("api", true);
        metrics.timing("cache.get", cacheTime);
        
        Sentry.addBreadcrumb({
          category: "cache",
          message: `Cache HIT: ${cacheKey}`,
          level: "info",
          data: { key: cacheKey, duration: cacheTime },
        });
        
        return { data: cached, cached: true };
      }
    } catch {
      // Cache miss or error
    }
    
    // Cache miss - fetch fresh data
    metrics.cacheHit("api", false);
    
    const fetchStart = performance.now();
    const data = await fetcher();
    const fetchTime = performance.now() - fetchStart;
    
    // Store in cache
    try {
      await cacheProvider.set(cacheKey, data, ttlSeconds);
    } catch {
      // Ignore cache write errors
    }
    
    Sentry.addBreadcrumb({
      category: "cache",
      message: `Cache MISS: ${cacheKey}`,
      level: "info",
      data: { key: cacheKey, fetchTime },
    });
    
    return { data, cached: false };
  };
}

/**
 * Rate limit wrapper with monitoring
 */
export function withRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
  handler: RouteHandler,
  checkLimit: (id: string, limit: number, window: number) => Promise<{ allowed: boolean; remaining: number }>
): RouteHandler {
  return async (request, context) => {
    const { allowed, remaining } = await checkLimit(identifier, limit, windowSeconds);
    
    Sentry.setMeasurement("ratelimit.remaining", remaining, "none");
    
    if (!allowed) {
      metrics.count("ratelimit.exceeded", 1, { endpoint: identifier });
      
      Sentry.addBreadcrumb({
        category: "ratelimit",
        message: `Rate limit exceeded: ${identifier}`,
        level: "warning",
      });
      
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(windowSeconds) } }
      );
    }
    
    return handler(request, context);
  };
}








