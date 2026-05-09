import type { Prisma } from "@prisma/client";

import { responseCache } from "@/server/cache";
import { prismaRead } from "@/server/db-read";

const PROFILE_PAGE_CACHE_TTL = 60;

export const profilePageUserSelect = {
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
      location: true,
      currency: true,
      availability: true,
      hourlyRate: true,
      responseTime: true,
    },
  },
  skills: {
    select: {
      id: true,
      skillId: true,
      experienceLevel: true,
      yearsOfExp: true,
      isPrimary: true,
      headline: true,
      rate: true,
      rateUnit: true,
      skillAvailability: true,
      description: true,
      skill: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: [
      { isPrimary: "desc" },
      { createdAt: "asc" },
    ],
  },
  _count: { select: { followers: true, following: true, reviewsReceived: true } },
} satisfies Prisma.UserSelect;

export type ProfilePageUser = Prisma.UserGetPayload<{
  select: typeof profilePageUserSelect;
}> & {
  avgRating: number | null;
};

export async function fetchProfilePageData(username: string): Promise<ProfilePageUser | null> {
  const cacheKey = `profile:page:${username.toLowerCase()}`;
  const cached = await responseCache.get<ProfilePageUser>(cacheKey);
  if (cached) return cached;

  const user = await prismaRead.user.findUnique({
    where: { username },
    select: profilePageUserSelect,
  });

  if (!user) return null;

  const avgRating = user._count.reviewsReceived > 0
    ? (await prismaRead.review.aggregate({
        where: { reviewedId: user.id },
        _avg: { rating: true },
      }))._avg.rating
    : null;

  const userWithRating = { ...user, avgRating };
  await responseCache.set(cacheKey, userWithRating, PROFILE_PAGE_CACHE_TTL);

  return userWithRating;
}

export async function fetchInitialFollowingState(
  currentUserId: string | undefined,
  profileUserId: string
) {
  if (!currentUserId) return false;

  const following = await prismaRead.follower.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: profileUserId,
      },
    },
    select: { id: true },
  });

  return Boolean(following);
}
