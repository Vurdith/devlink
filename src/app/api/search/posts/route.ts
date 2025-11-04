import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ posts: [] });
    }

    console.log("Searching for posts with query:", q);

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

    console.log("Found posts:", posts.length);

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

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 });
  }
}
