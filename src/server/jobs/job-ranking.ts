export interface JobRankingCandidate {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string | null;
  location: string | null;
  createdAt: Date;
  _count: {
    applications: number;
  };
  user: {
    profile: {
      verified: boolean;
    } | null;
  } | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeTerm(term: string) {
  return term.trim().toLowerCase();
}

function splitSkills(skills: string | null | undefined) {
  return (skills ?? "")
    .split(",")
    .map(normalizeTerm)
    .filter(Boolean);
}

function includesTerm(value: string | null | undefined, term: string) {
  return value?.toLowerCase().includes(term) ?? false;
}

function recencyScore(createdAt: Date, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / DAY_MS);
  if (ageDays <= 3) return 18;
  if (ageDays <= 7) return 14;
  if (ageDays <= 21) return 8;
  if (ageDays <= 45) return 3;
  return 0;
}

function budgetClarityScore(job: JobRankingCandidate) {
  if (job.budgetMin !== null && job.budgetMax !== null) return 8;
  if (job.budgetMin !== null || job.budgetMax !== null) return 5;
  return 0;
}

export function scoreJobRankingCandidate(
  job: JobRankingCandidate,
  viewerInterestTerms: string[],
  now = new Date()
) {
  const normalizedInterests = [
    ...new Set(
      viewerInterestTerms
        .map(normalizeTerm)
        .filter((term) => term.length >= 2)
    ),
  ].slice(0, 10);
  const jobSkills = splitSkills(job.skills);

  let score = 0;
  score += recencyScore(job.createdAt, now);
  score += budgetClarityScore(job);
  score += Math.min(8, Math.max(0, job.description.trim().length - 80) / 40);
  score += Math.min(8, job._count.applications * 2);
  if (job.location?.trim()) score += 3;
  if (job.user?.profile?.verified) score += 5;

  for (const term of normalizedInterests) {
    if (jobSkills.some((skill) => skill === term)) score += 26;
    else if (jobSkills.some((skill) => skill.includes(term) || term.includes(skill))) score += 18;
    else if (includesTerm(job.title, term)) score += 12;
    else if (includesTerm(job.description, term)) score += 7;
  }

  return Math.round(score * 10) / 10;
}

export function rankJobCandidates(
  jobs: JobRankingCandidate[],
  viewerInterestTerms: string[],
  now = new Date()
) {
  return [...jobs]
    .map((job) => ({
      job,
      score: scoreJobRankingCandidate(job, viewerInterestTerms, now),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.job.createdAt.getTime() - a.job.createdAt.getTime();
    })
    .map(({ job }) => job);
}
