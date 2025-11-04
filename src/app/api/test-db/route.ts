import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...");
    
    // Simple test query
    const postCount = await prisma.post.count();
    console.log("Post count:", postCount);
    
    return NextResponse.json({ 
      success: true, 
      postCount,
      message: "Database connection working" 
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}










