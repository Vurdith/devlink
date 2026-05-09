import { prismaRead } from "@/server/db-read";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/server/cache";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchCacheKeyPart,
} from "@/server/search/query-utils";

const SEARCH_CACHE_TTL = 120;
const DEFAULT_USER_LIMIT = 8;
const MAX_USER_LIMIT = 20;

type SearchUser = {
  id: string;
  username: string;
  name: string | null;
  profile: { avatarUrl: string | null; verified: boolean; profileType: string | null; bio: string | null } | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ users: [] });
  
  const term = normalizeSearchQuery(q, "@");
  if (!term) return NextResponse.json({ users: [] });
  const limit = normalizeSearchLimit(
    searchParams.get("limit"),
    DEFAULT_USER_LIMIT,
    MAX_USER_LIMIT
  );

  const cacheKey = `search:users:${searchCacheKeyPart(term)}:${limit}`;
  
  let users = await responseCache.get<SearchUser[]>(cacheKey);
  
  if (!users) {
    users = await prismaRead.user.findMany({
      where: {
        OR: [
          { username: { contains: term } },
          { name: { contains: term } },
        ],
      },
      take: limit,
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
    
    await responseCache.set(cacheKey, users, SEARCH_CACHE_TTL);
  }

  if (users.length === 0) {
    const response = NextResponse.json({ users: [] });
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    return response;
  }
  
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  let followingIds = new Set<string>();
  
  if (currentUserId && users.length > 0) {
    const relations = await prismaRead.follower.findMany({
      where: { followerId: currentUserId, followingId: { in: users.map(u => u.id) } },
      select: { followingId: true },
    });
    followingIds = new Set(relations.map(r => r.followingId));
  }
  
  const response = NextResponse.json({
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
  response.headers.set(
    "Cache-Control",
    currentUserId ? "private, no-store" : "public, max-age=60, stale-while-revalidate=120"
  );
  response.headers.set("Vary", "Cookie");
  return response;
}


