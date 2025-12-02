/**
 * Performance Dashboard API
 * 
 * Provides real-time performance metrics for DevLink monitoring.
 * Access at: /api/performance
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { performanceBudgets } from "@/lib/monitoring/performance";
import { metricsStore, resetMetrics } from "@/lib/monitoring/metrics";

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
    resetMetrics();
    return NextResponse.json({ success: true, message: "Metrics reset" });
  }
  
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
