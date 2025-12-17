/**
 * Sentry Performance Load Test
 * 
 * This script simulates real user traffic to populate Sentry with
 * performance data so you can identify optimization opportunities.
 * 
 * Run with: npx tsx scripts/sentry-load-test.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface TestResult {
  endpoint: string;
  status: number;
  duration: number;
  success: boolean;
}

const endpoints = [
  // Page loads
  { path: "/", name: "Home Page" },
  { path: "/home", name: "Feed Page" },
  { path: "/discover", name: "Discover Page" },
  { path: "/trending", name: "Trending Page" },
  { path: "/search?q=developer", name: "Search Page" },
  
  // API endpoints
  { path: "/api/feed/for-you", name: "For You Feed API" },
  { path: "/api/discover", name: "Discover API" },
  { path: "/api/hashtags/trending", name: "Trending Hashtags API" },
  { path: "/api/search/posts?q=test", name: "Search Posts API" },
  { path: "/api/search/users?q=dev", name: "Search Users API" },
];

async function testEndpoint(endpoint: { path: string; name: string }): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint.path}`, {
      headers: {
        "User-Agent": "SentryLoadTest/1.0",
        "Accept": "text/html,application/json",
      },
    });
    
    const duration = performance.now() - start;
    
    return {
      endpoint: endpoint.name,
      status: response.status,
      duration: Math.round(duration),
      success: response.ok,
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      endpoint: endpoint.name,
      status: 0,
      duration: Math.round(duration),
      success: false,
    };
  }
}

async function runLoadTest(iterations: number = 10) {
  console.log("🚀 Starting Sentry Performance Load Test");
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`🔄 Iterations: ${iterations}`);
  console.log("─".repeat(60));
  
  const allResults: TestResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`\n📊 Round ${i}/${iterations}`);
    
    // Test all endpoints in parallel
    const results = await Promise.all(endpoints.map(testEndpoint));
    allResults.push(...results);
    
    // Print results for this round
    for (const result of results) {
      const status = result.success ? "✅" : "❌";
      const speed = result.duration < 100 ? "🟢" : result.duration < 500 ? "🟡" : "🔴";
      console.log(`  ${status} ${speed} ${result.endpoint}: ${result.duration}ms (${result.status})`);
    }
    
    // Small delay between rounds to simulate real traffic patterns
    if (i < iterations) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("📈 PERFORMANCE SUMMARY");
  console.log("═".repeat(60));
  
  // Group by endpoint
  const byEndpoint = new Map<string, number[]>();
  for (const result of allResults) {
    if (!byEndpoint.has(result.endpoint)) {
      byEndpoint.set(result.endpoint, []);
    }
    byEndpoint.get(result.endpoint)!.push(result.duration);
  }
  
  // Calculate stats
  const stats: { name: string; avg: number; min: number; max: number; p95: number }[] = [];
  
  for (const [name, durations] of byEndpoint) {
    const sorted = [...durations].sort((a, b) => a - b);
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    stats.push({ name, avg, min, max, p95 });
  }
  
  // Sort by average duration (slowest first)
  stats.sort((a, b) => b.avg - a.avg);
  
  console.log("\n🐌 Slowest Endpoints (sorted by avg):\n");
  console.log("Endpoint                          | Avg    | Min    | Max    | P95");
  console.log("─".repeat(75));
  
  for (const stat of stats) {
    const name = stat.name.padEnd(33);
    const avg = `${stat.avg}ms`.padEnd(6);
    const min = `${stat.min}ms`.padEnd(6);
    const max = `${stat.max}ms`.padEnd(6);
    const p95 = `${stat.p95}ms`;
    console.log(`${name} | ${avg} | ${min} | ${max} | ${p95}`);
  }
  
  // Recommendations
  console.log("\n" + "═".repeat(60));
  console.log("💡 OPTIMIZATION RECOMMENDATIONS");
  console.log("═".repeat(60));
  
  const slowEndpoints = stats.filter(s => s.avg > 500);
  const mediumEndpoints = stats.filter(s => s.avg > 200 && s.avg <= 500);
  
  if (slowEndpoints.length > 0) {
    console.log("\n🔴 Critical (>500ms avg):");
    for (const s of slowEndpoints) {
      console.log(`   - ${s.name}: ${s.avg}ms avg - Needs immediate optimization`);
    }
  }
  
  if (mediumEndpoints.length > 0) {
    console.log("\n🟡 Needs Attention (200-500ms avg):");
    for (const s of mediumEndpoints) {
      console.log(`   - ${s.name}: ${s.avg}ms avg - Consider caching or query optimization`);
    }
  }
  
  const fastEndpoints = stats.filter(s => s.avg <= 200);
  if (fastEndpoints.length > 0) {
    console.log("\n🟢 Good (<200ms avg):");
    for (const s of fastEndpoints) {
      console.log(`   - ${s.name}: ${s.avg}ms avg ✓`);
    }
  }
  
  console.log("\n📊 Check Sentry dashboard for detailed traces:");
  console.log("   https://devlink-xy.sentry.io/performance/\n");
}

// Run the test
runLoadTest(10).catch(console.error);
















