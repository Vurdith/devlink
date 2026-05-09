import { responseCache } from "@/server/cache";

type AnomalyResult = {
  suspicious: boolean;
  reasons: string[];
  score: number;
};

const AUTH_BURST_WINDOW_SECONDS = 60;
const AUTH_BURST_THRESHOLD = 8;
const AUTH_BURST_SCORE = 50;
const FINGERPRINT_TTL_SECONDS = 60 * 60 * 24 * 30;
const NEW_FINGERPRINT_SCORE = 20;
const MAX_KNOWN_FINGERPRINTS = 10;
const POST_BURST_WINDOW_SECONDS = 60;
const POST_BURST_THRESHOLD = 20;
const POST_BURST_SCORE = 70;

function key(prefix: string, actorId: string) {
  return `anomaly:${prefix}:${actorId}`;
}

async function incrementWindowCounter(cacheKey: string, ttlSeconds: number): Promise<number> {
  const nextCount = ((await responseCache.get<number>(cacheKey)) ?? 0) + 1;
  await responseCache.set(cacheKey, nextCount, ttlSeconds);
  return nextCount;
}

async function recordNewFingerprint(actorId: string, fingerprint: string): Promise<boolean> {
  const fingerprintKey = key("fingerprints", actorId);
  const seenFingerprints =
    (await responseCache.get<string[]>(fingerprintKey)) ?? [];

  if (seenFingerprints.includes(fingerprint)) {
    return false;
  }

  const nextFingerprints = [...seenFingerprints, fingerprint].slice(
    -MAX_KNOWN_FINGERPRINTS
  );
  await responseCache.set(
    fingerprintKey,
    nextFingerprints,
    FINGERPRINT_TTL_SECONDS
  );
  return true;
}

export async function evaluateAuthAnomaly(input: {
  actorId: string;
  fingerprint: string;
}): Promise<AnomalyResult> {
  const reasons: string[] = [];
  let score = 0;

  if (await recordNewFingerprint(input.actorId, input.fingerprint)) {
    score += NEW_FINGERPRINT_SCORE;
    reasons.push("new_device_fingerprint");
  }

  const burstKey = key("auth_burst", input.actorId);
  const burstCount = await incrementWindowCounter(
    burstKey,
    AUTH_BURST_WINDOW_SECONDS
  );
  if (burstCount > AUTH_BURST_THRESHOLD) {
    score += AUTH_BURST_SCORE;
    reasons.push("auth_burst");
  }

  return {
    suspicious: score >= 50,
    reasons,
    score,
  };
}

export async function evaluatePostingAnomaly(input: {
  actorId: string;
}): Promise<AnomalyResult> {
  const reasons: string[] = [];
  let score = 0;

  const burstKey = key("post_burst", input.actorId);
  const burstCount = await incrementWindowCounter(
    burstKey,
    POST_BURST_WINDOW_SECONDS
  );
  if (burstCount > POST_BURST_THRESHOLD) {
    score += POST_BURST_SCORE;
    reasons.push("posting_burst");
  }

  return {
    suspicious: score >= 70,
    reasons,
    score,
  };
}
