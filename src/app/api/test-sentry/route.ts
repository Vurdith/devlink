import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "error";

  if (type === "error") {
    throw new Error("🧪 Test error from DevLink API - Sentry is working!");
  }

  if (type === "manual") {
    Sentry.captureException(new Error("🧪 Manually captured test error"));
    return NextResponse.json({ 
      success: true, 
      message: "Manual error sent to Sentry!" 
    });
  }

  if (type === "message") {
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





















