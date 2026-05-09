import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

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
  return prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });
}

export async function getViewerFollowingIds(currentUserId: string | undefined, viewedUserIds: string[]) {
  if (!currentUserId || viewedUserIds.length === 0) {
    return new Set<string>();
  }

  const existingFollows = await prisma.follower.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: viewedUserIds },
    },
    select: { followingId: true },
  });

  return new Set(existingFollows.map((follow) => follow.followingId));
}
