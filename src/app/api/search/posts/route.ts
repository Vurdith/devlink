import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

const SEARCH_CACHE_TTL = 60; // Cache for 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ posts: [] });
    }

    const cacheKey = `search:posts:${q.toLowerCase()}`;
    
    // Try cache first
    const cached = await responseCache.get<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ posts: cached });
    }

    // Search for posts that contain the search term in content
    const posts = await prisma.post.findMany({
      where: {
        replyToId: null, // Only main posts, not replies
        content: {
          contains: q
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform posts to include basic data
    const transformedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: post.user,
      isLiked: false,
      isReposted: false,
      isSaved: false
    }));
    
    // Cache the results
    await responseCache.set(cacheKey, transformedPosts, SEARCH_CACHE_TTL);

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 });
  }
}
