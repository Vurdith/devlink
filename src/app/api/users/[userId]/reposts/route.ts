import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";

// NO server-side caching for engagement tabs - they change frequently and caching causes sync issues

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;
    
    // OPTIMIZED: Use select instead of include
    const repostedPosts = await prisma.post.findMany({
      where: {
        reposts: { some: { userId } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: postListSelect
    });

    const postIds = repostedPosts.map(p => p.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(repostedPosts)
    );
    const transformedPosts = repostedPosts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );
    
    // Return fresh data without caching - engagement data must be real-time
    return NextResponse.json(transformedPosts, {
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error fetching reposted posts:", error);
    return NextResponse.json({ error: "Failed to fetch reposted posts" }, { status: 500 });
  }
}
