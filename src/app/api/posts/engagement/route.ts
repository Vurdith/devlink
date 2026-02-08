import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

/**
 * Lightweight endpoint to fetch engagement state for multiple posts
 * Used for client-side hydration after cached page loads
 * 
 * This enables:
 * - Fast initial page loads (cached HTML)
 * - Fresh engagement state (fetched client-side)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    // If not logged in, return empty - no engagement state to check
    if (!session?.user?.id) {
      return NextResponse.json({ engagement: {} });
    }

    const { postIds } = await request.json();
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ engagement: {} });
    }

    // Limit to prevent abuse
    const limitedPostIds = postIds.slice(0, 100);
    const userId = session.user.id;

    // Batch fetch all engagement data in parallel
    const [likes, reposts, saves] = await Promise.all([
      prisma.postLike.findMany({
        where: { postId: { in: limitedPostIds }, userId },
        select: { postId: true }
      }),
      prisma.postRepost.findMany({
        where: { postId: { in: limitedPostIds }, userId },
        select: { postId: true }
      }),
      prisma.savedPost.findMany({
        where: { postId: { in: limitedPostIds }, userId },
        select: { postId: true }
      })
    ]);

    // Build engagement map
    const likedSet = new Set(likes.map(l => l.postId));
    const repostedSet = new Set(reposts.map(r => r.postId));
    const savedSet = new Set(saves.map(s => s.postId));

    const engagement: Record<string, { isLiked: boolean; isReposted: boolean; isSaved: boolean }> = {};
    
    for (const postId of limitedPostIds) {
      engagement[postId] = {
        isLiked: likedSet.has(postId),
        isReposted: repostedSet.has(postId),
        isSaved: savedSet.has(postId)
      };
    }

    return NextResponse.json({ engagement }, {
      headers: {
        // Short cache for this endpoint - engagement can change
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=10'
      }
    });
  } catch (error) {
    console.error("Error fetching engagement:", error);
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 });
  }
}

