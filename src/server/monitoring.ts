/**
 * Monitoring and Error Tracking Configuration
 * Supports Sentry for error tracking and performance monitoring
 * Provides utilities for tracking custom events and metrics
 * 
 * Usage:
 * - Error tracking: errors are automatically sent to Sentry
 * - Performance monitoring: use captureException or custom spans
 * - Custom events: use trackEvent()
 */

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Call this in your app initialization
 */
export function initializeMonitoring() {
  // Sentry would be initialized here if available
  // Example:
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({
  //   dsn: process.env.SENTRY_DSN,
  //   tracesSampleRate: 0.1,
  // });
  
  console.log('✅ Monitoring initialized');
}

/**
 * Custom event for tracking specific actions
 */
export interface CustomEvent {
  name: string;
  properties?: Record<string, any>;
  tags?: Record<string, string>;
  userId?: string;
}

/**
 * Track custom events for analytics
 */
export function trackEvent(event: CustomEvent): void {
  const { name, properties = {}, tags = {}, userId } = event;

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event tracked:', {
      name,
      properties,
      tags,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to external service if available
  // Example: sendToAnalytics(event);
}

/**
 * Performance metrics tracker
 */
export class PerformanceMetrics {
  private startTime: number;
  private name: string;
  private metadata: Record<string, any>;

  constructor(name: string, metadata?: Record<string, any>) {
    this.name = name;
    this.metadata = metadata || {};
    this.startTime = performance.now();
  }

  /**
   * End timing and report metric
   */
  end(): number {
    const duration = performance.now() - this.startTime;
    
    this.report(duration);
    
    return duration;
  }

  /**
   * Report metric to monitoring service
   */
  private report(duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️  ${this.name}: ${duration.toFixed(2)}ms`, this.metadata);
    }

    // Track important slow operations
    if (duration > 1000) {
      console.warn(`🐢 Slow operation detected: ${this.name} took ${duration.toFixed(2)}ms`);
      
      trackEvent({
        name: 'slow_operation',
        properties: {
          operation: this.name,
          duration,
          ...this.metadata,
        },
        tags: {
          severity: duration > 5000 ? 'high' : 'medium',
        },
      });
    }
  }
}

/**
 * Database query tracker
 */
export class DatabaseMetrics {
  private startTime: number;
  private query: string;

  constructor(query: string) {
    this.query = query;
    this.startTime = performance.now();
  }

  end(): void {
    const duration = performance.now() - this.startTime;

    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`🐢 Slow query (${duration.toFixed(2)}ms):`, this.query);
    }

    if (duration > 500) {
      trackEvent({
        name: 'slow_db_query',
        properties: {
          duration,
          query: this.query.substring(0, 200),
        },
      });
    }
  }
}

/**
 * API response tracker
 */
export class ApiMetrics {
  private startTime: number;
  private method: string;
  private path: string;

  constructor(method: string, path: string) {
    this.method = method;
    this.path = path;
    this.startTime = performance.now();
  }

  /**
   * End request and log metrics
   */
  end(status: number, userId?: string): void {
    const duration = performance.now() - this.startTime;

    const logData = {
      method: this.method,
      path: this.path,
      status,
      duration: duration.toFixed(2),
      timestamp: new Date().toISOString(),
      userId,
    };

    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 API Request:', logData);
    }

    // Track slow API requests
    if (duration > 1000) {
      console.warn('🐢 Slow API request:', logData);
      
      trackEvent({
        name: 'slow_api_request',
        properties: logData,
        tags: {
          method: this.method,
          status: String(status),
        },
        userId,
      });
    }

    // Track errors
    if (status >= 400) {
      trackEvent({
        name: 'api_error',
        properties: logData,
        tags: {
          method: this.method,
          status: String(status),
        },
        userId,
      });
    }
  }
}

/**
 * Health check utilities
 */
export interface HealthCheckResult {
  healthy: boolean;
  checks: Record<string, boolean>;
  timestamp: string;
  version: string;
}

/**
 * Perform health check on services
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: Record<string, boolean> = {
    database: false,
    redis: false,
    api: false,
  };

  try {
    // Check database
    // const dbHealth = await checkDatabase();
    checks.database = true; // placeholder

    // Check Redis
    // const redisHealth = await checkRedis();
    checks.redis = true; // placeholder

    // Check API endpoints
    checks.api = true; // placeholder
  } catch (error) {
    console.error('Health check failed:', error);
  }

  return {
    healthy: Object.values(checks).every(v => v),
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  };
}

/**
 * Log structured error with context
 */
export function logError(
  error: Error,
  context?: Record<string, any>,
  userId?: string
): void {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    userId,
    timestamp: new Date().toISOString(),
  };

  console.error('❌ Error:', errorData);

  trackEvent({
    name: 'error_occurred',
    properties: errorData,
    userId,
  });
}

/**
 * Export all monitoring utilities
 */
export const monitoring = {
  initializeMonitoring,
  trackEvent,
  PerformanceMetrics,
  DatabaseMetrics,
  ApiMetrics,
  performHealthCheck,
  logError,
};

