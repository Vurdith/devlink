const MAX_SEARCH_QUERY_LENGTH = 80;

export function normalizeSearchQuery(query: string, prefix?: string) {
  const trimmed = query.trim();
  const unprefixed = prefix && trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed;
  return unprefixed.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
}

export function normalizeSearchLimit(
  limit: string | null,
  defaultLimit: number,
  maxLimit: number
) {
  const parsed = Number.parseInt(limit ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultLimit;
  return Math.min(parsed, maxLimit);
}

export function searchCacheKeyPart(query: string) {
  return encodeURIComponent(query.toLowerCase());
}
