export interface PostSearchCandidate {
  id: string;
  content: string;
  createdAt: Date;
  media?: Array<unknown>;
  user: {
    username: string;
    name: string | null;
    profile?: {
      bio?: string | null;
      profileType?: string | null;
      verified?: boolean | null;
    } | null;
  };
  _count: {
    likes: number;
    replies: number;
    reposts: number;
    savedBy: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(value: string | null | undefined) {
  return value?.toLowerCase() ?? "";
}

function includesTerm(value: string | null | undefined, query: string) {
  return normalize(value).includes(query);
}

function startsWithTerm(value: string | null | undefined, query: string) {
  return normalize(value).startsWith(query);
}

function equalsTerm(value: string | null | undefined, query: string) {
  return normalize(value) === query;
}

function tokenize(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/^#/, "").trim())
    .filter((term) => term.length >= 2);
}

function recencyScore(createdAt: Date, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / DAY_MS);
  if (ageDays <= 2) return 10;
  if (ageDays <= 14) return 7;
  if (ageDays <= 45) return 4;
  if (ageDays <= 120) return 1;
  return 0;
}

function engagementScore(candidate: PostSearchCandidate) {
  const { likes, replies, reposts, savedBy } = candidate._count;
  const weighted = likes + replies * 3 + reposts * 2 + savedBy * 2;
  return Math.min(16, Math.log2(weighted + 1) * 4);
}

export function scorePostSearchCandidate(
  candidate: PostSearchCandidate,
  query: string,
  now = new Date(),
  indexedRank?: number
) {
  const normalizedQuery = query.toLowerCase().replace(/^#/, "").trim();
  const terms = tokenize(normalizedQuery);
  let score = 0;

  if (indexedRank !== undefined) {
    score += Math.max(0, 70 - indexedRank * 8);
  }

  if (equalsTerm(candidate.content, normalizedQuery)) score += 90;
  else if (startsWithTerm(candidate.content, normalizedQuery)) score += 62;
  else if (includesTerm(candidate.content, normalizedQuery)) score += 42;

  const matchedTerms = terms.filter((term) => includesTerm(candidate.content, term));
  if (terms.length > 1 && matchedTerms.length === terms.length) score += 30;
  else score += matchedTerms.length * 10;

  if (includesTerm(candidate.content, `#${normalizedQuery}`)) score += 18;
  if (equalsTerm(candidate.user.username, normalizedQuery)) score += 18;
  else if (includesTerm(candidate.user.username, normalizedQuery)) score += 10;
  if (includesTerm(candidate.user.name, normalizedQuery)) score += 8;
  if (includesTerm(candidate.user.profile?.bio, normalizedQuery)) score += 5;
  if (includesTerm(candidate.user.profile?.profileType, normalizedQuery)) score += 4;

  if (candidate.user.profile?.verified) score += 4;
  score += Math.min(6, (candidate.media?.length ?? 0) * 3);
  score += engagementScore(candidate);
  score += recencyScore(candidate.createdAt, now);

  return score;
}

export function rankPostSearchCandidates<TPost extends PostSearchCandidate>(
  candidates: TPost[],
  query: string,
  now = new Date(),
  indexedPostIds: string[] = []
) {
  const indexedRanks = new Map(indexedPostIds.map((id, index) => [id, index]));

  return mergeUniquePostCandidates(candidates)
    .map((candidate) => ({
      candidate,
      score: scorePostSearchCandidate(candidate, query, now, indexedRanks.get(candidate.id)),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime();
    })
    .map(({ candidate }) => candidate);
}

export function mergeUniquePostCandidates<TPost extends PostSearchCandidate>(candidates: TPost[]) {
  const seen = new Set<string>();
  const merged: TPost[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    merged.push(candidate);
  }

  return merged;
}
