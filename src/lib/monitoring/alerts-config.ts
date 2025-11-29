/**
 * Sentry Performance Budgets & Alert Thresholds
 * 
 * These are the performance targets for DevLink to be "one of the most performant websites"
 * 
 * To set up alerts in Sentry:
 * 1. Go to https://devlink-xy.sentry.io/alerts/new/metric/
 * 2. Create alerts for each threshold below
 */

export const PERFORMANCE_BUDGETS = {
  // Page Load Times (Target: Under 1 second)
  pages: {
    landing: { target: 800, critical: 1500 },      // ms
    home: { target: 1000, critical: 2000 },        // Feed with data
    discover: { target: 800, critical: 1500 },
    profile: { target: 1000, critical: 2000 },
    post: { target: 600, critical: 1200 },
  },

  // API Response Times (Target: Under 300ms)
  api: {
    discover: { target: 200, critical: 500 },
    search: { target: 150, critical: 400 },
    feed: { target: 250, critical: 600 },
    post: { target: 100, critical: 300 },
    auth: { target: 200, critical: 500 },
  },

  // Database Queries (Target: Under 100ms)
  db: {
    simple: { target: 50, critical: 150 },         // Single record fetch
    list: { target: 100, critical: 300 },          // List queries
    complex: { target: 200, critical: 500 },       // Joins, aggregations
  },

  // Web Vitals (Google's "Good" thresholds)
  webVitals: {
    LCP: { target: 2500, critical: 4000 },         // Largest Contentful Paint
    FID: { target: 100, critical: 300 },           // First Input Delay
    CLS: { target: 0.1, critical: 0.25 },          // Cumulative Layout Shift
    TTFB: { target: 800, critical: 1800 },         // Time to First Byte
    INP: { target: 200, critical: 500 },           // Interaction to Next Paint
  },
} as const;

/**
 * Sentry Alert Rules to Create:
 * 
 * 1. High Error Rate Alert
 *    - Metric: Number of Errors
 *    - Threshold: > 10 errors in 1 hour
 *    - Action: Email notification
 * 
 * 2. Slow Page Load Alert
 *    - Metric: transaction.duration
 *    - Filter: transaction.op:pageload
 *    - Threshold: p95 > 3000ms
 *    - Action: Email notification
 * 
 * 3. Slow API Alert
 *    - Metric: transaction.duration
 *    - Filter: transaction.op:http.server AND transaction:/api/*
 *    - Threshold: p95 > 500ms
 *    - Action: Email notification
 * 
 * 4. Poor Web Vitals Alert
 *    - Metric: measurements.lcp
 *    - Threshold: p75 > 2500ms
 *    - Action: Email notification
 */

export const SENTRY_ALERT_RULES = [
  {
    name: "High Error Rate",
    metric: "count()",
    filter: "event.type:error",
    threshold: { critical: 10, window: "1h" },
  },
  {
    name: "Slow Page Loads",
    metric: "p95(transaction.duration)",
    filter: "transaction.op:pageload",
    threshold: { critical: 3000, window: "5m" },
  },
  {
    name: "Slow API Responses",
    metric: "p95(transaction.duration)",
    filter: "transaction.op:http.server transaction:/api/*",
    threshold: { critical: 500, window: "5m" },
  },
  {
    name: "Poor LCP (Web Vital)",
    metric: "p75(measurements.lcp)",
    filter: "",
    threshold: { critical: 2500, window: "1h" },
  },
];

