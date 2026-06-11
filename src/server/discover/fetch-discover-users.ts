import { responseCache } from "@/server/cache";
import { prismaRead } from "@/server/db-read";
import { differenceInDays } from "date-fns";

const PAGE_SIZE = 24;
const PERSONALIZED_CANDIDATE_LIMIT = 96;
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
    headline?: string | null;
    availability?: string | null;
  } | null;
  skills?: Array<{
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
    posts?: number;
    portfolioItems?: number;
    reviewsReceived?: number;
  };
  discoverReason?: string;
  discoverScore?: number;
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

export function getComplementaryProfileTypes(profileType?: string | null) {
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

export function buildDiscoverReason(params: {
  matchingSkills: string[];
  recentPostDays: number | null;
  user: DiscoverUser;
}) {
  const { matchingSkills, recentPostDays, user } = params;
  if (matchingSkills.length > 0) return `Matches ${matchingSkills.slice(0, 2).join(", ")}`;
  if (recentPostDays !== null && recentPostDays <= 7) return "Posted this week";
  if ((user._count.portfolioItems ?? 0) > 0) {
    const count = user._count.portfolioItems ?? 0;
    return `${count} portfolio item${count === 1 ? "" : "s"}`;
  }
  if ((user._count.reviewsReceived ?? 0) > 0) {
    const count = user._count.reviewsReceived ?? 0;
    return `${count} review${count === 1 ? "" : "s"}`;
  }
  if (user.profile?.verified) return "Verified profile";
  return "Relevant public profile";
}

async function fetchPersonalizedDiscoverUsers(
  currentUserId: string,
  profileType: string,
  cursor?: string
): Promise<DiscoverResult> {
  const normalizedProfileType = normalizeDiscoverProfileType(profileType);
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  const currentUser = await prismaRead.user.findUnique({
    where: { id: currentUserId },
    select: {
      profile: { select: { profileType: true } },
      skills: { select: { skillId: true } },
      following: { select: { followingId: true }, take: 1000 },
    },
  });

  if (!currentUser) {
    return fetchDiscoverUsers(profileType, cursor);
  }

  const where = normalizedProfileType === "all"
    ? { profile: { isNot: null } }
    : { profile: { is: { profileType: normalizedProfileType } } };

  const candidates = await prismaRead.user.findMany({
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
        take: 5,
      },
      posts: {
        where: { replyToId: null, isScheduled: false },
        select: { createdAt: true },
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
    },
    orderBy: [
      { profile: { verified: "desc" } },
      { posts: { _count: "desc" } },
      { followers: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: PERSONALIZED_CANDIDATE_LIMIT,
  });

  const now = new Date();
  const currentSkillIds = new Set(currentUser.skills.map((skill) => skill.skillId));
  const followedIds = new Set(currentUser.following.map((follow) => follow.followingId));
  const complementaryTypes = getComplementaryProfileTypes(currentUser.profile?.profileType);

  const ranked = rankDiscoverCandidates({
    candidates,
    currentUserId,
    currentSkillIds,
    followedIds,
    complementaryTypes,
    now,
  });

  const page = ranked.slice(safeOffset, safeOffset + PAGE_SIZE + 1);
  const hasMore = page.length > PAGE_SIZE;
  const usersToReturn = (hasMore ? page.slice(0, PAGE_SIZE) : page).map(({ user }) => user);

  return {
    users: usersToReturn,
    nextCursor: hasMore ? String(safeOffset + PAGE_SIZE) : null,
    hasMore,
  };
}

export function rankDiscoverCandidates(params: {
  candidates: Array<DiscoverUser & {
    skills?: NonNullable<DiscoverUser["skills"]>;
    posts?: Array<{ createdAt: Date }>;
  }>;
  currentUserId: string;
  currentSkillIds: Set<string>;
  followedIds: Set<string>;
  complementaryTypes: Set<string>;
  now?: Date;
}) {
  const now = params.now ?? new Date();

  return params.candidates
    .map((user) => {
      const matchingSkills = (user.skills ?? [])
        .filter((userSkill) => params.currentSkillIds.has(userSkill.skillId))
        .map((userSkill) => userSkill.skill.name);
      const latestPost = user.posts?.[0]?.createdAt;
      const recentPostDays = latestPost ? differenceInDays(now, latestPost) : null;
      const isCurrentUser = user.id === params.currentUserId;
      const isFollowing = params.followedIds.has(user.id);

      let score = 0;
      score += matchingSkills.length * 20;
      if (user.profile?.profileType && params.complementaryTypes.has(user.profile.profileType)) score += 16;
      if (user.profile?.verified) score += 8;
      if (user.profile?.bio || user.profile?.headline) score += 8;
      if (user.profile?.availability === "AVAILABLE") score += 7;
      if (recentPostDays !== null) score += Math.max(0, 18 - recentPostDays * 2);
      score += Math.min(12, (user._count.portfolioItems ?? 0) * 4);
      score += Math.min(10, (user._count.reviewsReceived ?? 0) * 3);
      score += Math.min(10, Math.log10(user._count.followers + 1) * 5);
      score += Math.max(0, 6 - differenceInDays(now, user.createdAt) / 20);
      if (isFollowing) score -= 18;
      if (isCurrentUser) score -= 100;

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          profile: user.profile,
          skills: user.skills,
          _count: user._count,
          discoverReason: buildDiscoverReason({ matchingSkills, recentPostDays, user }),
          discoverScore: Math.round(score * 10) / 10,
        } satisfies DiscoverUser,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
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

export async function fetchDiscoverUsersForViewer(
  currentUserId: string | undefined,
  profileType: string = "all",
  cursor?: string
): Promise<DiscoverResult> {
  if (!currentUserId) {
    return fetchDiscoverUsers(profileType, cursor);
  }

  return fetchPersonalizedDiscoverUsers(currentUserId, profileType, cursor);
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





















