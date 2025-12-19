import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

const PAGE_SIZE = 24;
const CACHE_TTL = 120; // 2 minutes cache for faster loads

export interface DiscoverUser {
  id: string;
  username: string;
  name: string | null;
  createdAt: Date;
  profile: {
    avatarUrl: string | null;
    bannerUrl: string | null;
    profileType: string;
    verified: boolean;
    bio: string | null;
  } | null;
  _count: {
    followers: number;
    following: number;
  };
}

export interface DiscoverResult {
  users: DiscoverUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Fetch users for the discover page with caching
 * Optimized for server-side rendering
 */
export async function fetchDiscoverUsers(
  profileType: string = "all",
  cursor?: string
): Promise<DiscoverResult> {
  const cacheKey = `discover:v2:${profileType}:${cursor || "initial"}`;

  // Try cache first
  const cached = await responseCache.get<DiscoverResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build where clause
  const where: any = {};
  if (profileType && profileType !== "all") {
    where.profile = { profileType };
  }

  // Optimized query - fetch only what's needed
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          avatarUrl: true,
          bannerUrl: true,
          profileType: true,
          verified: true,
          bio: true,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
    orderBy: [
      { profile: { verified: "desc" } },
      { followers: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: PAGE_SIZE + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  const hasMore = users.length > PAGE_SIZE;
  const usersToReturn = hasMore ? users.slice(0, PAGE_SIZE) : users;
  const nextCursor = hasMore ? usersToReturn[usersToReturn.length - 1].id : null;

  const result: DiscoverResult = {
    users: usersToReturn,
    nextCursor,
    hasMore,
  };

  // Cache the result
  await responseCache.set(cacheKey, result, CACHE_TTL);

  return result;
}

/**
 * Get following status for a list of users
 */
export async function getFollowingStatus(
  currentUserId: string,
  userIds: string[]
): Promise<Set<string>> {
  if (!currentUserId || userIds.length === 0) {
    return new Set();
  }

  const following = await prisma.follower.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: userIds },
    },
    select: { followingId: true },
  });

  return new Set(following.map((f) => f.followingId));
}




















