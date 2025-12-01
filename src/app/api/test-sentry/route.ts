import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

// Test endpoint to verify Sentry is working
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "error";

  if (type === "error") {
    // This will be caught and sent to Sentry
    throw new Error("🧪 Test error from DevLink API - Sentry is working!");
  }

  if (type === "manual") {
    // Manually capture an error
    Sentry.captureException(new Error("🧪 Manually captured test error"));
    return NextResponse.json({ 
      success: true, 
      message: "Manual error sent to Sentry!" 
    });
  }

  if (type === "message") {
    // Capture a message (not an error)
    Sentry.captureMessage("🧪 Test message from DevLink - Sentry integration verified!");
    return NextResponse.json({ 
      success: true, 
      message: "Test message sent to Sentry!" 
    });
  }

  return NextResponse.json({
    message: "Sentry test endpoint",
    usage: {
      error: "/api/test-sentry?type=error - Throws an error",
      manual: "/api/test-sentry?type=manual - Manually captures error",
      message: "/api/test-sentry?type=message - Sends a message",
    }
  });
}



