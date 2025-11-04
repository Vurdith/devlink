import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing simple search...");
    
    // Get all posts first
    const allPosts = await prisma.post.findMany({
      take: 5,
      select: {
        id: true,
        content: true
      }
    });
    
    console.log("All posts:", allPosts);
    
    // Try a simple search
    const searchPosts = await prisma.post.findMany({
      where: {
        content: {
          contains: "DevLink"
        }
      },
      take: 5,
      select: {
        id: true,
        content: true
      }
    });
    
    console.log("Search results:", searchPosts);
    
    return NextResponse.json({ 
      success: true,
      allPosts,
      searchPosts,
      message: "Search test completed" 
    });
  } catch (error) {
    console.error("Search test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}








