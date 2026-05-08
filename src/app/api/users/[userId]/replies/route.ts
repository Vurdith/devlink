import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { repliedPostListSelect } from "@/server/posts/post-selects";

// NO server-side caching for user content tabs - they need real-time accuracy

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
    
    // OPTIMIZED query
    const repliedPosts = await prisma.post.findMany({
      where: {
        replyToId: { not: null },
        userId
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: repliedPostListSelect
    });

    const postIds = repliedPosts.map(p => p.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(repliedPosts)
    );
    const transformedPosts = repliedPosts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );
    
    // Return fresh data without caching
    return NextResponse.json({ posts: transformedPosts }, {
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error fetching replied posts:", error);
    return NextResponse.json({ error: "Failed to fetch replied posts" }, { status: 500 });
  }
}
