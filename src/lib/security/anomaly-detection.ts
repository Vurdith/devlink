import { responseCache } from "@/lib/cache";

type AnomalyResult = {
  suspicious: boolean;
  reasons: string[];
  score: number;
};

function key(prefix: string, actorId: string) {
  return `anomaly:${prefix}:${actorId}`;
}

export async function evaluateAuthAnomaly(input: {
  actorId: string;
  fingerprint: string;
  now?: Date;
}): Promise<AnomalyResult> {
  const now = input.now ?? new Date();
  const reasons: string[] = [];
  let score = 0;

  const fingerprintKey = key("fingerprints", input.actorId);
  const seenFingerprints =
    (await responseCache.get<string[]>(fingerprintKey)) ?? [];

  if (!seenFingerprints.includes(input.fingerprint)) {
    score += 20;
    reasons.push("new_device_fingerprint");
    await responseCache.set(
      fingerprintKey,
      [...seenFingerprints, input.fingerprint].slice(-10),
      60 * 60 * 24 * 30
    );
  }

  const burstKey = key("auth_burst", input.actorId);
  const burstCount = ((await responseCache.get<number>(burstKey)) ?? 0) + 1;
  await responseCache.set(burstKey, burstCount, 60);
  if (burstCount > 8) {
    score += 50;
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
  const burstCount = ((await responseCache.get<number>(burstKey)) ?? 0) + 1;
  await responseCache.set(burstKey, burstCount, 60);
  if (burstCount > 20) {
    score += 70;
    reasons.push("posting_burst");
  }

  return {
    suspicious: score >= 70,
    reasons,
    score,
  };
}
