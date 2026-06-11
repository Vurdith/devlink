export interface ProjectSearchCandidate {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string | null;
  mediaUrls: string | null;
  links: string | null;
  createdAt: Date;
  user: {
    username: string;
    name: string | null;
    profile?: {
      avatarUrl: string | null;
    } | null;
  };
  skills: Array<{
    skill: {
      name: string;
    };
  }>;
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

function splitListField(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function recencyScore(createdAt: Date, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / DAY_MS);
  if (ageDays <= 7) return 8;
  if (ageDays <= 30) return 5;
  if (ageDays <= 90) return 2;
  return 0;
}

export function scoreProjectSearchCandidate(candidate: ProjectSearchCandidate, query: string, now = new Date()) {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  if (equalsTerm(candidate.title, normalizedQuery)) score += 90;
  else if (startsWithTerm(candidate.title, normalizedQuery)) score += 60;
  else if (includesTerm(candidate.title, normalizedQuery)) score += 40;

  if (includesTerm(candidate.description, normalizedQuery)) score += 18;
  if (includesTerm(candidate.category, normalizedQuery)) score += 16;

  const tags = splitListField(candidate.tags);
  if (tags.some((tag) => equalsTerm(tag, normalizedQuery))) score += 34;
  else if (tags.some((tag) => includesTerm(tag, normalizedQuery))) score += 22;

  const skillNames = candidate.skills.map(({ skill }) => skill.name);
  if (skillNames.some((name) => equalsTerm(name, normalizedQuery))) score += 42;
  else if (skillNames.some((name) => includesTerm(name, normalizedQuery))) score += 28;

  if (equalsTerm(candidate.user.username, normalizedQuery)) score += 20;
  else if (includesTerm(candidate.user.username, normalizedQuery)) score += 10;
  if (includesTerm(candidate.user.name, normalizedQuery)) score += 8;

  const descriptionLength = candidate.description?.trim().length ?? 0;
  if (descriptionLength >= 220) score += 12;
  else if (descriptionLength >= 100) score += 7;
  else if (descriptionLength >= 40) score += 3;

  const mediaCount = splitListField(candidate.mediaUrls).length;
  const linkCount = splitListField(candidate.links).length;
  score += Math.min(10, mediaCount * 4);
  score += Math.min(6, linkCount * 3);
  score += Math.min(8, candidate.skills.length * 2);
  score += recencyScore(candidate.createdAt, now);

  return score;
}

export function rankProjectSearchCandidates(
  candidates: ProjectSearchCandidate[],
  query: string,
  now = new Date()
) {
  return [...candidates]
    .map((candidate) => ({
      candidate,
      score: scoreProjectSearchCandidate(candidate, query, now),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime();
    })
    .map(({ candidate }) => candidate);
}
