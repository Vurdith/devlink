/**
 * Performance Metrics Store & Tracking Functions
 * 
 * In-memory metrics store (would use Redis in production)
 */

// In-memory metrics store
export const metricsStore = {
  requests: 0,
  errors: 0,
  totalLatency: 0,
  endpoints: new Map<string, { count: number; totalMs: number; errors: number }>(),
  dbQueries: 0,
  dbTotalMs: 0,
  cacheHits: 0,
  cacheMisses: 0,
  rankingCalls: 0,
  rankingTotalMs: 0,
  postsRanked: 0,
  startTime: Date.now(),
};

// Track a request
export function trackRequest(endpoint: string, durationMs: number, isError: boolean) {
  metricsStore.requests++;
  metricsStore.totalLatency += durationMs;
  
  if (isError) metricsStore.errors++;
  
  const stats = metricsStore.endpoints.get(endpoint) || { count: 0, totalMs: 0, errors: 0 };
  stats.count++;
  stats.totalMs += durationMs;
  if (isError) stats.errors++;
  metricsStore.endpoints.set(endpoint, stats);
}

// Track DB query
export function trackDbQuery(durationMs: number) {
  metricsStore.dbQueries++;
  metricsStore.dbTotalMs += durationMs;
}

// Track cache
export function trackCache(hit: boolean) {
  if (hit) metricsStore.cacheHits++;
  else metricsStore.cacheMisses++;
}

// Track ranking
export function trackRanking(durationMs: number, postCount: number) {
  metricsStore.rankingCalls++;
  metricsStore.rankingTotalMs += durationMs;
  metricsStore.postsRanked += postCount;
}

// Reset metrics
export function resetMetrics() {
  metricsStore.requests = 0;
  metricsStore.errors = 0;
  metricsStore.totalLatency = 0;
  metricsStore.endpoints.clear();
  metricsStore.dbQueries = 0;
  metricsStore.dbTotalMs = 0;
  metricsStore.cacheHits = 0;
  metricsStore.cacheMisses = 0;
  metricsStore.rankingCalls = 0;
  metricsStore.rankingTotalMs = 0;
  metricsStore.postsRanked = 0;
  metricsStore.startTime = Date.now();
}


