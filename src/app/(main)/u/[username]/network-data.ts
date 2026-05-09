import { Prisma } from "@prisma/client";
import { prismaRead } from "@/server/db-read";

export const NETWORK_PAGE_SIZE = 100;

export const networkUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  name: true,
  _count: { select: { followers: true, following: true } },
  profile: {
    select: {
      avatarUrl: true,
      bannerUrl: true,
      profileType: true,
      verified: true,
      bio: true,
      website: true,
      location: true,
    },
  },
});

export async function getProfileIdentity(username: string) {
  return prismaRead.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      _count: { select: { followers: true, following: true } },
    },
  });
}

export async function getViewerFollowingIds(currentUserId: string | undefined, viewedUserIds: string[]) {
  if (!currentUserId || viewedUserIds.length === 0) {
    return new Set<string>();
  }

  const existingFollows = await prismaRead.follower.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: viewedUserIds },
    },
    select: { followingId: true },
  });

  return new Set(existingFollows.map((follow) => follow.followingId));
}

export function formatNetworkDescription(
  totalCount: number,
  singular: string,
  plural: string,
  context: string
) {
  const label = totalCount === 1 ? singular : plural;
  const suffix = totalCount > NETWORK_PAGE_SIZE ? ` Showing latest ${NETWORK_PAGE_SIZE}.` : "";
  return `${totalCount} ${label} ${context}.${suffix}`;
}

export async function getFollowersPage(userId: string) {
  return prismaRead.follower.findMany({
    where: { followingId: userId },
    select: { follower: { select: networkUserSelect } },
    orderBy: { createdAt: "desc" },
    take: NETWORK_PAGE_SIZE,
  });
}

export async function getFollowingPage(userId: string) {
  return prismaRead.follower.findMany({
    where: { followerId: userId },
    select: { following: { select: networkUserSelect } },
    orderBy: { createdAt: "desc" },
    take: NETWORK_PAGE_SIZE,
  });
}
