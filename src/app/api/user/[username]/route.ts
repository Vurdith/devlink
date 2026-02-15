import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

// Cache user profiles for 60 seconds to reduce DB load
const USER_CACHE_TTL = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cacheKey = `user:profile:${username.toLowerCase()}`;
    
    // Try cache first
    const cached = await responseCache.get<{ user: Record<string, unknown> }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" }
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        profile: {
          select: {
            avatarUrl: true,
            bannerUrl: true,
            profileType: true,
            verified: true,
            bio: true,
            website: true,
            location: true
          }
        },
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = { user };
    
    // Cache the result
    await responseCache.set(cacheKey, response, USER_CACHE_TTL);

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS" }
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}



