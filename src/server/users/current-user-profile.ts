import type { Prisma } from "@prisma/client";

import { prismaRead } from "@/server/db-read";

export const currentUserProfileSelect = {
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
    },
  },
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
} satisfies Prisma.UserSelect;

export type CurrentUserProfile = Prisma.UserGetPayload<{
  select: typeof currentUserProfileSelect;
}>;

export function fetchCurrentUserProfile(username?: string | null) {
  if (!username) return Promise.resolve(null);

  return prismaRead.user.findUnique({
    where: { username },
    select: currentUserProfileSelect,
  });
}

export async function needsPasswordSetup(userId?: string | null) {
  if (!userId) return false;

  const user = await prismaRead.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  return !user?.password;
}
