import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";

const SEARCH_CACHE_TTL = 120; // Cache search results for 2 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ users: [] });
  
  // allow leading @
  const term = q.startsWith("@") ? q.slice(1) : q;
  const cacheKey = `search:users:${term.toLowerCase()}`;
  
  // Try cache first for the base user data
  let users = await responseCache.get<any[]>(cacheKey);
  
  if (!users) {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: term } },
          { name: { contains: term } },
        ],
      },
      take: 8,
      orderBy: { username: "asc" },
      select: { 
        id: true,
        username: true,
        name: true,
        profile: {
          select: {
            avatarUrl: true,
            verified: true,
            profileType: true,
            bio: true
          }
        }
      },
    });
    
    // Cache the results
    await responseCache.set(cacheKey, users, SEARCH_CACHE_TTL);
  }
  
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  let followingIds = new Set<string>();
  
  if (currentUserId && users.length > 0) {
    const relations = await prisma.follower.findMany({
      where: { followerId: currentUserId, followingId: { in: users.map(u => u.id) } },
      select: { followingId: true },
    });
    followingIds = new Set(relations.map(r => r.followingId));
  }
  
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatarUrl: u.profile?.avatarUrl || null,
      verified: !!u.profile?.verified,
      profileType: u.profile?.profileType || null,
      bio: u.profile?.bio || null,
      isFollowing: followingIds.has(u.id),
      isYou: currentUserId === u.id,
    })),
  });
}


