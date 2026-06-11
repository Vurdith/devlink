import type { Prisma } from "@prisma/client";
import { prismaRead } from "@/server/db-read";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/server/cache";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchCacheKeyPart,
} from "@/server/search/query-utils";
import { rankUserSearchCandidates, type UserSearchCandidate } from "@/server/search/user-ranking";

const SEARCH_CACHE_TTL = 120;
const DEFAULT_USER_LIMIT = 8;
const MAX_USER_LIMIT = 20;
const USER_IDENTITY_POOL_SIZE = 75;
const USER_CONTEXT_POOL_SIZE = 100;

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

  const cacheKey = `search:users:v2:${searchCacheKeyPart(term)}:${limit}`;

  let users = await responseCache.get<UserSearchCandidate[]>(cacheKey);

  if (!users) {
    const searchUserSelect = {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          avatarUrl: true,
          verified: true,
          profileType: true,
          bio: true,
          headline: true,
          availability: true,
        },
      },
      skills: {
        select: {
          skill: {
            select: {
              name: true,
              category: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 5,
      },
      _count: {
        select: {
          followers: true,
          posts: true,
          portfolioItems: true,
          reviewsReceived: true,
        },
      },
    } satisfies Prisma.UserSelect;
    const identityWhere = {
      OR: [
        { username: { contains: term } },
        { name: { contains: term } },
      ],
    };
    const contextWhere = {
      OR: [
        ...identityWhere.OR,
        { profile: { is: { bio: { contains: term } } } },
        { profile: { is: { headline: { contains: term } } } },
        { profile: { is: { profileType: { contains: term } } } },
        {
          skills: {
            some: {
              skill: {
                OR: [
                  { name: { contains: term } },
                  { category: { contains: term } },
                ],
              },
            },
          },
        },
      ],
    };

    const [identityMatches, contextMatches] = await Promise.all([
      prismaRead.user.findMany({
        where: identityWhere,
        take: USER_IDENTITY_POOL_SIZE,
        orderBy: [
          { profile: { verified: "desc" } },
          { followers: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        select: searchUserSelect,
      }),
      prismaRead.user.findMany({
        where: contextWhere,
        take: USER_CONTEXT_POOL_SIZE,
        orderBy: [
          { profile: { verified: "desc" } },
          { followers: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        select: searchUserSelect,
      }),
    ]);

    users = rankUserSearchCandidates([...identityMatches, ...contextMatches], term).slice(0, limit);

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
      where: { followerId: currentUserId, followingId: { in: users.map((u) => u.id) } },
      select: { followingId: true },
    });
    followingIds = new Set(relations.map((r) => r.followingId));
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
