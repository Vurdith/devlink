export interface HashtagSearchCandidate {
  name: string;
  createdAt: Date;
  latestPostAt: Date | null;
  _count: {
    posts: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function recencyScore(date: Date | null, now: Date) {
  if (!date) return 0;
  const ageDays = Math.max(0, (now.getTime() - date.getTime()) / DAY_MS);
  if (ageDays <= 3) return 18;
  if (ageDays <= 14) return 12;
  if (ageDays <= 45) return 7;
  if (ageDays <= 120) return 3;
  return 0;
}

export function scoreHashtagSearchCandidate(
  candidate: HashtagSearchCandidate,
  query: string,
  now = new Date()
) {
  const normalizedQuery = query.toLowerCase().replace(/^#/, "").trim();
  const normalizedName = candidate.name.toLowerCase();
  let score = 0;

  if (normalizedName === normalizedQuery) score += 120;
  else if (normalizedName.startsWith(normalizedQuery)) score += 70;
  else if (normalizedName.includes(normalizedQuery)) score += 42;

  score += Math.min(28, Math.log2(candidate._count.posts + 1) * 7);
  score += recencyScore(candidate.latestPostAt ?? candidate.createdAt, now);

  return score;
}

export function rankHashtagSearchCandidates<TTag extends HashtagSearchCandidate>(
  candidates: TTag[],
  query: string,
  now = new Date()
) {
  return mergeUniqueHashtagCandidates(candidates)
    .map((candidate) => ({
      candidate,
      score: scoreHashtagSearchCandidate(candidate, query, now),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.candidate._count.posts !== a.candidate._count.posts) {
        return b.candidate._count.posts - a.candidate._count.posts;
      }
      return a.candidate.name.localeCompare(b.candidate.name);
    })
    .map(({ candidate }) => candidate);
}

export function mergeUniqueHashtagCandidates<TTag extends HashtagSearchCandidate>(candidates: TTag[]) {
  const seen = new Set<string>();
  const merged: TTag[] = [];

  for (const candidate of candidates) {
    const key = candidate.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }

  return merged;
}
