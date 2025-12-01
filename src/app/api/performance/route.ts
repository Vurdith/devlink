/**
 * Performance Dashboard API
 * 
 * Provides real-time performance metrics for DevLink monitoring.
 * Access at: /api/performance
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { performanceBudgets } from "@/lib/monitoring/performance";

// In-memory metrics store (would use Redis in production)
const metricsStore = {
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

export async function GET() {
  const uptimeMs = Date.now() - metricsStore.startTime;
  const uptimeHours = uptimeMs / (1000 * 60 * 60);
  
  // Calculate aggregates
  const avgLatency = metricsStore.requests > 0 
    ? metricsStore.totalLatency / metricsStore.requests 
    : 0;
  
  const errorRate = metricsStore.requests > 0 
    ? (metricsStore.errors / metricsStore.requests) * 100 
    : 0;
  
  const avgDbQuery = metricsStore.dbQueries > 0 
    ? metricsStore.dbTotalMs / metricsStore.dbQueries 
    : 0;
  
  const cacheHitRate = (metricsStore.cacheHits + metricsStore.cacheMisses) > 0
    ? (metricsStore.cacheHits / (metricsStore.cacheHits + metricsStore.cacheMisses)) * 100
    : 0;
  
  const avgRanking = metricsStore.rankingCalls > 0
    ? metricsStore.rankingTotalMs / metricsStore.rankingCalls
    : 0;
  
  const msPerPost = metricsStore.postsRanked > 0
    ? metricsStore.rankingTotalMs / metricsStore.postsRanked
    : 0;

  // Build endpoint stats
  const endpointStats: Record<string, { 
    requests: number; 
    avgMs: number; 
    errorRate: number;
    budget: number;
    status: "good" | "warning" | "critical";
  }> = {};
  
  for (const [endpoint, stats] of metricsStore.endpoints) {
    const avgMs = stats.count > 0 ? stats.totalMs / stats.count : 0;
    const budget = (performanceBudgets.api as Record<string, number>)[endpoint] || 500;
    
    let status: "good" | "warning" | "critical" = "good";
    if (avgMs > budget * 1.5) status = "critical";
    else if (avgMs > budget) status = "warning";
    
    endpointStats[endpoint] = {
      requests: stats.count,
      avgMs: Math.round(avgMs),
      errorRate: stats.count > 0 ? (stats.errors / stats.count) * 100 : 0,
      budget,
      status,
    };
  }

  // Send metrics to Sentry
  Sentry.setMeasurement("dashboard.avg_latency", avgLatency, "millisecond");
  Sentry.setMeasurement("dashboard.error_rate", errorRate, "percent");
  Sentry.setMeasurement("dashboard.cache_hit_rate", cacheHitRate, "percent");

  const response = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    
    // Overview
    overview: {
      uptimeHours: Math.round(uptimeHours * 10) / 10,
      totalRequests: metricsStore.requests,
      errorRate: Math.round(errorRate * 100) / 100,
      avgLatencyMs: Math.round(avgLatency),
    },
    
    // Performance grades
    grades: {
      latency: avgLatency < 200 ? "A" : avgLatency < 500 ? "B" : avgLatency < 1000 ? "C" : "F",
      errors: errorRate < 0.1 ? "A" : errorRate < 1 ? "B" : errorRate < 5 ? "C" : "F",
      cache: cacheHitRate > 90 ? "A" : cacheHitRate > 70 ? "B" : cacheHitRate > 50 ? "C" : "F",
      database: avgDbQuery < 50 ? "A" : avgDbQuery < 100 ? "B" : avgDbQuery < 200 ? "C" : "F",
    },
    
    // Database
    database: {
      queries: metricsStore.dbQueries,
      avgQueryMs: Math.round(avgDbQuery),
      queriesPerHour: Math.round(metricsStore.dbQueries / Math.max(uptimeHours, 0.1)),
    },
    
    // Cache
    cache: {
      hits: metricsStore.cacheHits,
      misses: metricsStore.cacheMisses,
      hitRate: Math.round(cacheHitRate * 10) / 10,
    },
    
    // Ranking Algorithm
    ranking: {
      calls: metricsStore.rankingCalls,
      avgMs: Math.round(avgRanking),
      postsProcessed: metricsStore.postsRanked,
      msPerPost: Math.round(msPerPost * 100) / 100,
    },
    
    // Endpoints
    endpoints: endpointStats,
    
    // Performance budgets (for reference)
    budgets: performanceBudgets,
    
    // Recommendations
    recommendations: generateRecommendations({
      avgLatency,
      errorRate,
      cacheHitRate,
      avgDbQuery,
      avgRanking,
      endpointStats,
    }),
    
    // Sentry dashboard link
    sentryDashboard: "https://devlink-xy.sentry.io/performance/",
  };

  return NextResponse.json(response);
}

function generateRecommendations(data: {
  avgLatency: number;
  errorRate: number;
  cacheHitRate: number;
  avgDbQuery: number;
  avgRanking: number;
  endpointStats: Record<string, { avgMs: number; budget: number; status: string }>;
}): string[] {
  const recommendations: string[] = [];
  
  if (data.avgLatency > 500) {
    recommendations.push("🔴 Average latency is high (>500ms). Consider adding caching to slow endpoints.");
  }
  
  if (data.errorRate > 1) {
    recommendations.push("🔴 Error rate is above 1%. Check Sentry for recurring exceptions.");
  }
  
  if (data.cacheHitRate < 70) {
    recommendations.push("🟡 Cache hit rate is low. Consider caching more frequently accessed data.");
  }
  
  if (data.avgDbQuery > 100) {
    recommendations.push("🟡 Database queries are slow. Review indexes and query optimization.");
  }
  
  if (data.avgRanking > 50) {
    recommendations.push("🟡 Ranking algorithm is taking >50ms. Consider pre-computing scores.");
  }
  
  // Check individual endpoints
  for (const [endpoint, stats] of Object.entries(data.endpointStats)) {
    if (stats.status === "critical") {
      recommendations.push(`🔴 Endpoint '${endpoint}' is critically slow (${stats.avgMs}ms vs ${stats.budget}ms budget)`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push("✅ All systems performing within budget! Keep monitoring for regressions.");
  }
  
  return recommendations;
}

// Reset metrics (for testing)
export async function POST(request: Request) {
  const { action } = await request.json();
  
  if (action === "reset") {
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
    
    return NextResponse.json({ success: true, message: "Metrics reset" });
  }
  
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}



