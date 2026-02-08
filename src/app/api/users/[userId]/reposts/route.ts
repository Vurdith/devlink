import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { getUniqueViewCounts } from "@/lib/view-utils";

// NO server-side caching for engagement tabs - they change frequently and caching causes sync issues

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getAuthSession();
    const currentUserId = (session?.user as any)?.id;
    
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
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        isSlideshow: true,
        location: true,
        embedUrls: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                profileType: true,
                verified: true,
              }
            },
            _count: { select: { followers: true, following: true } }
          }
        },
        _count: { select: { likes: true, reposts: true, replies: true } },
        media: { select: { id: true, mediaUrl: true, mediaType: true, order: true }, orderBy: { order: 'asc' } },
        poll: {
          select: {
            id: true,
            question: true,
            expiresAt: true,
            isMultiple: true,
            options: { select: { id: true, text: true, _count: { select: { votes: true } } } }
          }
        },
      }
    });

    const postIds = repostedPosts.map(p => p.id);
    
    const [viewCountMap, userLikes, userReposts, userSaves] = await Promise.all([
      getUniqueViewCounts(postIds),
      currentUserId ? prisma.postLike.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : [],
      currentUserId ? prisma.postRepost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : [],
      currentUserId ? prisma.savedPost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : []
    ]);
    
    const likedSet = new Set(userLikes.map(l => l.postId));
    const repostedSet = new Set(userReposts.map(r => r.postId));
    const savedSet = new Set(userSaves.map(s => s.postId));

    const transformedPosts = repostedPosts.map((post: any) => {
      const poll = post.poll ? {
        ...post.poll,
        options: post.poll.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votes: opt._count.votes,
        })),
        totalVotes: post.poll.options.reduce((sum: number, opt: any) => sum + opt._count.votes, 0),
      } : null;

      return {
        ...post,
        views: viewCountMap.get(post.id) || 0,
        isLiked: likedSet.has(post.id),
        isReposted: repostedSet.has(post.id),
        isSaved: savedSet.has(post.id),
        likes: [],
        reposts: [],
        savedBy: [],
        replies: Array(post._count?.replies || 0).fill(null),
        poll,
      };
    });
    
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
