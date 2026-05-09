import { responseCache } from "@/server/cache";
import { prismaRead } from "@/server/db-read";

const PAGE_SIZE = 24;
const CACHE_TTL = 120;
const DISCOVER_PROFILE_TYPES = new Set([
  "DEVELOPER",
  "CLIENT",
  "INFLUENCER",
  "STUDIO",
  "INVESTOR",
]);

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

export function normalizeDiscoverProfileType(profileType?: string | null) {
  if (!profileType || profileType === "all") return "all";
  const normalized = profileType.toUpperCase();
  return DISCOVER_PROFILE_TYPES.has(normalized) ? normalized : "all";
}

export function normalizeDiscoverCursor(cursor?: string | null) {
  const normalized = cursor?.trim();
  return normalized && normalized.length <= 128 ? normalized : undefined;
}

export async function fetchDiscoverUsers(
  profileType: string = "all",
  cursor?: string
): Promise<DiscoverResult> {
  const normalizedProfileType = normalizeDiscoverProfileType(profileType);
  const normalizedCursor = normalizeDiscoverCursor(cursor);
  const cacheKey = `discover:v3:${normalizedProfileType}:${normalizedCursor || "initial"}`;

  const cached = await responseCache.get<DiscoverResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const where: { profile?: { profileType: string } } = {};
  if (normalizedProfileType !== "all") {
    where.profile = { profileType: normalizedProfileType };
  }

  const users = await prismaRead.user.findMany({
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
    ...(normalizedCursor && {
      skip: 1,
      cursor: { id: normalizedCursor },
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

  await responseCache.set(cacheKey, result, CACHE_TTL);

  return result;
}

export async function getFollowingStatus(
  currentUserId: string,
  userIds: string[]
): Promise<Set<string>> {
  if (!currentUserId || userIds.length === 0) {
    return new Set();
  }

  const following = await prismaRead.follower.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: userIds },
    },
    select: { followingId: true },
  });

  return new Set(following.map((f) => f.followingId));
}





















