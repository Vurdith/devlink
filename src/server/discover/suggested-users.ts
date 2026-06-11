import { differenceInDays } from "date-fns";
import type { Prisma } from "@prisma/client";

import { prismaRead } from "@/server/db-read";

const SUGGESTED_FOLLOW_LIMIT = 4;
const CANDIDATE_LIMIT = 80;

const suggestedUserSelect = {
  id: true,
  username: true,
  name: true,
  createdAt: true,
  profile: {
    select: {
      avatarUrl: true,
      profileType: true,
      verified: true,
      bio: true,
      headline: true,
      availability: true,
    },
  },
  skills: {
    select: {
      skillId: true,
      isPrimary: true,
      skill: { select: { name: true, category: true } },
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    take: 6,
  },
  posts: {
    select: { createdAt: true },
    where: { replyToId: null, isScheduled: false },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
  _count: {
    select: {
      followers: true,
      following: true,
      posts: true,
      portfolioItems: true,
      reviewsReceived: true,
    },
  },
} satisfies Prisma.UserSelect;

type SuggestedUserCandidate = Prisma.UserGetPayload<{ select: typeof suggestedUserSelect }>;
type SuggestedUserCandidateWithNetwork = SuggestedUserCandidate & {
  mutualFollowCount?: number;
};

export interface SuggestedFollowUser {
  id: string;
  username: string;
  name: string | null;
  profile: {
    avatarUrl: string | null;
    profileType: string;
    verified: boolean;
    bio: string | null;
    headline: string | null;
    availability: string | null;
  } | null;
  skills: Array<{
    skillId: string;
    isPrimary: boolean;
    skill: {
      name: string;
      category: string;
    };
  }>;
  _count: {
    followers: number;
    following: number;
    posts: number;
    portfolioItems: number;
    reviewsReceived: number;
  };
  reason: string;
  matchingSkills: string[];
}

function getComplementaryProfileTypes(profileType?: string | null) {
  switch (profileType) {
    case "CLIENT":
    case "STUDIO":
      return new Set(["DEVELOPER", "INFLUENCER"]);
    case "DEVELOPER":
    case "INFLUENCER":
      return new Set(["CLIENT", "STUDIO", "DEVELOPER"]);
    case "INVESTOR":
      return new Set(["STUDIO", "DEVELOPER"]);
    default:
      return new Set(["DEVELOPER", "CLIENT", "STUDIO"]);
  }
}

function buildReason(
  candidate: SuggestedUserCandidateWithNetwork,
  matchingSkills: string[],
  recentPostDays: number | null
) {
  if (matchingSkills.length > 0) {
    return `Matches ${matchingSkills.slice(0, 2).join(", ")}`;
  }

  if ((candidate.mutualFollowCount ?? 0) > 0) {
    const count = candidate.mutualFollowCount ?? 0;
    return `Followed by ${count} ${count === 1 ? "person" : "people"} you follow`;
  }

  if (recentPostDays !== null && recentPostDays <= 7) {
    return "Posted this week";
  }

  if (candidate._count.portfolioItems > 0) {
    return `${candidate._count.portfolioItems} portfolio item${candidate._count.portfolioItems === 1 ? "" : "s"}`;
  }

  if (candidate.profile?.verified) {
    return "Verified profile";
  }

  return "Active public profile";
}

function scoreCandidate(params: {
  candidate: SuggestedUserCandidateWithNetwork;
  currentSkillIds: Set<string>;
  complementaryTypes: Set<string>;
  now: Date;
}) {
  const { candidate, currentSkillIds, complementaryTypes, now } = params;
  const matchingSkills = candidate.skills
    .filter((userSkill) => currentSkillIds.has(userSkill.skillId))
    .map((userSkill) => userSkill.skill.name);
  const latestPost = candidate.posts[0]?.createdAt;
  const recentPostDays = latestPost ? differenceInDays(now, latestPost) : null;
  const profileType = candidate.profile?.profileType;

  let score = 0;
  score += matchingSkills.length * 18;
  if (profileType && complementaryTypes.has(profileType)) score += 16;
  if (candidate.profile?.verified) score += 10;
  if (candidate.profile?.bio || candidate.profile?.headline) score += 8;
  if (candidate.profile?.availability === "AVAILABLE") score += 8;
  score += Math.min(18, (candidate.mutualFollowCount ?? 0) * 7);
  if (recentPostDays !== null) score += Math.max(0, 18 - recentPostDays * 2);
  score += Math.min(12, candidate._count.portfolioItems * 4);
  score += Math.min(10, candidate._count.reviewsReceived * 3);
  score += Math.min(12, Math.log10(candidate._count.followers + 1) * 6);
  score += Math.max(0, 8 - differenceInDays(now, candidate.createdAt) / 14);

  return {
    candidate,
    matchingSkills,
    recentPostDays,
    score,
  };
}

export function rankSuggestedFollowCandidates(params: {
  candidates: SuggestedUserCandidateWithNetwork[];
  currentSkillIds: Set<string>;
  complementaryTypes: Set<string>;
  now?: Date;
  limit?: number;
}) {
  const now = params.now ?? new Date();
  const limit = Math.max(1, Math.min(params.limit ?? SUGGESTED_FOLLOW_LIMIT, 8));

  return params.candidates
    .map((candidate) =>
      scoreCandidate({
        candidate,
        currentSkillIds: params.currentSkillIds,
        complementaryTypes: params.complementaryTypes,
        now,
      })
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate, matchingSkills, recentPostDays }) => ({
      id: candidate.id,
      username: candidate.username,
      name: candidate.name,
      profile: candidate.profile,
      skills: candidate.skills,
      _count: candidate._count,
      reason: buildReason(candidate, matchingSkills, recentPostDays),
      matchingSkills: matchingSkills.slice(0, 3),
    }));
}

export async function fetchSuggestedFollows(
  currentUserId?: string | null,
  limit = SUGGESTED_FOLLOW_LIMIT
): Promise<SuggestedFollowUser[]> {
  if (!currentUserId) return [];

  const currentUser = await prismaRead.user.findUnique({
    where: { id: currentUserId },
    select: {
      profile: { select: { profileType: true } },
      skills: { select: { skillId: true } },
      following: { select: { followingId: true }, take: 1000 },
    },
  });

  if (!currentUser) return [];

  const followedIds = new Set(currentUser.following.map((follow) => follow.followingId));
  const candidates = await prismaRead.user.findMany({
    where: {
      id: {
        not: currentUserId,
        notIn: Array.from(followedIds),
      },
      profile: { isNot: null },
    },
    select: suggestedUserSelect,
    orderBy: [
      { profile: { verified: "desc" } },
      { posts: { _count: "desc" } },
      { followers: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: CANDIDATE_LIMIT,
  });

  const mutualFollowCounts = new Map<string, number>();
  if (followedIds.size > 0 && candidates.length > 0) {
    const mutualFollows = await prismaRead.follower.groupBy({
      by: ["followingId"],
      where: {
        followerId: { in: Array.from(followedIds) },
        followingId: { in: candidates.map((candidate) => candidate.id) },
      },
      _count: {
        followerId: true,
      },
    });

    for (const mutualFollow of mutualFollows) {
      mutualFollowCounts.set(mutualFollow.followingId, mutualFollow._count.followerId);
    }
  }

  const currentSkillIds = new Set(currentUser.skills.map((skill) => skill.skillId));
  const complementaryTypes = getComplementaryProfileTypes(currentUser.profile?.profileType);

  return rankSuggestedFollowCandidates({
    candidates: candidates.map((candidate) => ({
      ...candidate,
      mutualFollowCount: mutualFollowCounts.get(candidate.id) ?? 0,
    })),
    currentSkillIds,
    complementaryTypes,
    limit,
  });
}
