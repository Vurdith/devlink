import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

/**
 * Health check endpoint for monitoring and load balancers
 * Returns service status and basic diagnostics
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: "connected",
        responseTime: `${responseTime}ms`,
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: "disconnected",
      },
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : "Service unavailable"
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}

