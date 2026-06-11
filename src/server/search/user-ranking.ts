export interface UserSearchCandidate {
  id: string;
  username: string;
  name: string | null;
  createdAt: Date;
  profile: {
    avatarUrl: string | null;
    verified: boolean;
    profileType: string | null;
    bio: string | null;
    headline?: string | null;
    availability?: string | null;
  } | null;
  skills: Array<{
    skill: {
      name: string;
      category: string;
    };
  }>;
  _count: {
    followers: number;
    posts: number;
    portfolioItems: number;
    reviewsReceived: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function includesTerm(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

function startsWithTerm(value: string | null | undefined, query: string) {
  return value?.toLowerCase().startsWith(query) ?? false;
}

function equalsTerm(value: string | null | undefined, query: string) {
  return value?.toLowerCase() === query;
}

function profileFreshnessScore(createdAt: Date, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / DAY_MS);
  if (ageDays <= 14) return 5;
  if (ageDays <= 60) return 3;
  if (ageDays <= 180) return 1;
  return 0;
}

export function scoreUserSearchCandidate(candidate: UserSearchCandidate, query: string, now = new Date()) {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  if (equalsTerm(candidate.username, normalizedQuery)) score += 150;
  else if (startsWithTerm(candidate.username, normalizedQuery)) score += 72;
  else if (includesTerm(candidate.username, normalizedQuery)) score += 45;

  if (equalsTerm(candidate.name, normalizedQuery)) score += 76;
  else if (startsWithTerm(candidate.name, normalizedQuery)) score += 52;
  else if (includesTerm(candidate.name, normalizedQuery)) score += 30;

  if (includesTerm(candidate.profile?.headline, normalizedQuery)) score += 22;
  if (includesTerm(candidate.profile?.bio, normalizedQuery)) score += 14;
  if (includesTerm(candidate.profile?.profileType, normalizedQuery)) score += 12;

  const skillNames = candidate.skills.map(({ skill }) => skill.name);
  const skillCategories = candidate.skills.map(({ skill }) => skill.category);
  if (skillNames.some((name) => equalsTerm(name, normalizedQuery))) score += 34;
  else if (skillNames.some((name) => includesTerm(name, normalizedQuery))) score += 24;
  if (skillCategories.some((category) => includesTerm(category, normalizedQuery))) score += 10;

  if (candidate.profile?.verified) score += 8;
  if (candidate.profile?.availability === "AVAILABLE") score += 5;
  if (candidate.profile?.bio || candidate.profile?.headline) score += 5;
  score += Math.min(7, candidate.skills.length * 2);
  score += Math.min(9, candidate._count.portfolioItems * 3);
  score += Math.min(7, candidate._count.reviewsReceived * 3);
  score += Math.min(7, Math.log10(candidate._count.followers + 1) * 4);
  score += Math.min(4, candidate._count.posts);
  score += profileFreshnessScore(candidate.createdAt, now);

  return score;
}

export function rankUserSearchCandidates(
  candidates: UserSearchCandidate[],
  query: string,
  now = new Date()
) {
  return mergeUniqueUserCandidates(candidates)
    .map((candidate) => ({
      candidate,
      score: scoreUserSearchCandidate(candidate, query, now),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.candidate.profile?.verified !== a.candidate.profile?.verified) {
        return Number(Boolean(b.candidate.profile?.verified)) - Number(Boolean(a.candidate.profile?.verified));
      }
      return b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime();
    })
    .map(({ candidate }) => candidate);
}

export function mergeUniqueUserCandidates(candidates: UserSearchCandidate[]) {
  const seen = new Set<string>();
  const merged: UserSearchCandidate[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    merged.push(candidate);
  }

  return merged;
}
