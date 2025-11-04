import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    // Get user IP address for anonymous tracking
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
    
    // Get user agent for additional uniqueness
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Create a unique identifier (either user ID or IP + user agent hash)
    const userId = session?.user?.id || null;
    
    // Use upsert to prevent race conditions
    const now = new Date();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // First, try to find existing view
    const existingView = await prisma.postView.findFirst({
      where: {
        postId,
        userId: userId || null,
      },
      orderBy: {
        viewedAt: 'desc'
      }
    });

    // Check if we're in cooldown period
    if (existingView) {
      const timeSinceLastView = now.getTime() - existingView.viewedAt.getTime();
      
      if (timeSinceLastView < cooldownPeriod) {
        // Still in cooldown, return current count
        const viewCount = await prisma.postView.count({
          where: { postId },
        });
        
        return NextResponse.json({ 
          success: true, 
          views: viewCount,
          message: "View already counted recently"
        });
      }
    }

    // Create new view record (upsert not working due to constraint name issue)
    try {
      await prisma.postView.create({
        data: {
          postId,
          userId,
          ipAddress: ip,
          userAgent: userAgent,
          viewedAt: now,
        },
      });
    } catch (error: any) {
      // If it's a unique constraint error, update the existing record
      if (error.code === 'P2002') {
        await prisma.postView.updateMany({
          where: {
            postId,
            userId: userId || null,
          },
          data: {
            viewedAt: now,
            ipAddress: ip,
            userAgent: userAgent,
          },
        });
      } else {
        throw error;
      }
    }

    // Get the current view count by counting PostView records
    const viewCount = await prisma.postView.count({
      where: { postId },
    });

    return NextResponse.json({ 
      success: true, 
      views: viewCount,
      message: "View counted successfully"
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
