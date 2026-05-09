import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import { parsePaginationParams } from "@/lib/pagination";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    let saved: boolean;
    if (existingSave) {
      // Unsave the post
      await prisma.savedPost.delete({
        where: { userId_postId: { userId, postId } }
      });
      saved = false;
    } else {
      // Save the post
      await prisma.savedPost.create({
        data: {
          userId,
          postId
        }
      });
      saved = true;
    }

    // Invalidate ALL relevant caches - MUST await
    await Promise.all([
      responseCache.invalidatePattern(/^feed:/),
      responseCache.invalidatePattern(new RegExp(`^user:${userId}:`)),
      responseCache.invalidatePattern(/^hashtag:/),
      responseCache.invalidatePattern(new RegExp(`^post:${postId}`)),
      responseCache.invalidatePattern(new RegExp(`^saved-posts:${userId}:`))
    ]);

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Save/unsave post error:", error);
    return NextResponse.json({ error: "Failed to save/unsave post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, skip } = parsePaginationParams(searchParams, { defaultLimit: 50 });
    const userId = session.user.id;

    // Saved-post tabs need fresh data immediately after unsave actions.
    const savedPosts = await prismaRead.savedPost.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: postListSelect
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    const postIds = savedPosts.map(sp => sp.post.id);
    const currentUserId = (session.user as { id?: string })?.id;
    const posts = savedPosts.map((savedPost) => savedPost.post);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(posts)
    );

    const postsWithViewCounts = savedPosts.map((savedPost) => {
      return {
        ...savedPost,
        post: attachPostEngagement(savedPost.post, engagementSummary),
      };
    });

    // Return fresh data without caching - profile tab updates need to be instant
    return NextResponse.json({ savedPosts: postsWithViewCounts }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Saved posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 });
  }
}
