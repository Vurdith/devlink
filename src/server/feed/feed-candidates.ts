export function mergeUniqueFeedCandidates<TCandidate extends { id: string }>(
  primaryCandidates: TCandidate[],
  ...secondaryCandidateGroups: TCandidate[][]
): TCandidate[] {
  const seen = new Set<string>();
  const merged: TCandidate[] = [];

  for (const candidate of [primaryCandidates, ...secondaryCandidateGroups].flat()) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    merged.push(candidate);
  }

  return merged;
}
