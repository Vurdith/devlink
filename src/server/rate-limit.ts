import { Redis } from "@upstash/redis";
import RedisIO from "ioredis";
import { createLogger } from "@/server/logger";
import { checkRateLimitWithRust } from "@/server/services/hotpath-client";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type MemoryRateLimitRecord = {
  count: number;
  resetAt: number;
};

const logger = createLogger("rate-limit");
const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_SECONDS = 60;
const MIN_TTL_SECONDS = 1;
const MAX_MEMORY_KEYS = 10_000;
const RATE_LIMIT_KEY_PREFIX = "ratelimit";

let upstashClient: Redis | null = null;
let ioRedisClient: RedisIO | null = null;
let upstashTemporarilyDisabled = false;

function isDnsNotFoundError(error: unknown): boolean {
  const err = error as { code?: unknown; cause?: { code?: unknown }; message?: unknown } | null;
  const code = err?.code ?? err?.cause?.code;
  if (code === "ENOTFOUND") return true;
  if (typeof err?.message === "string" && err.message.includes("getaddrinfo ENOTFOUND")) return true;
  return false;
}

function disableUpstash(error: unknown) {
  if (upstashTemporarilyDisabled) return;
  upstashTemporarilyDisabled = true;
  logger.warn({ error }, "Disabling Upstash Redis after DNS lookup failure");
  upstashClient = null;
}

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  upstashClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else if (process.env.REDIS_URL) {
  ioRedisClient = new RedisIO(process.env.REDIS_URL);
}

const memoryStore = new Map<string, MemoryRateLimitRecord>();

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

function buildRateLimitKey(identifier: string): string {
  return `${RATE_LIMIT_KEY_PREFIX}:${identifier}`;
}

function resetFromTtl(ttlSeconds: number, windowSeconds: number): number {
  const normalizedTtl = ttlSeconds > 0 ? ttlSeconds : windowSeconds;
  return Date.now() + Math.max(MIN_TTL_SECONDS, normalizedTtl) * 1000;
}

function toRateLimitResult(requests: number, limit: number, reset: number): RateLimitResult {
  return {
    success: requests <= limit,
    limit,
    remaining: Math.max(0, limit - requests),
    reset,
  };
}

function pruneExpiredMemoryRecords(now: number) {
  for (const [key, record] of memoryStore) {
    if (now > record.resetAt) {
      memoryStore.delete(key);
    }
  }
}

function trimMemoryStore(now: number) {
  if (memoryStore.size < MAX_MEMORY_KEYS) return;
  pruneExpiredMemoryRecords(now);
  if (memoryStore.size < MAX_MEMORY_KEYS) return;

  const oldestKey = memoryStore.keys().next().value as string | undefined;
  if (oldestKey) {
    memoryStore.delete(oldestKey);
  }
}

async function checkUpstashRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  if (!upstashClient) return null;

  try {
    const requests = await upstashClient.incr(key);
    if (requests === 1) {
      await upstashClient.expire(key, windowSeconds);
    }
    const ttl = await upstashClient.ttl(key);
    return toRateLimitResult(requests, limit, resetFromTtl(ttl, windowSeconds));
  } catch (error) {
    if (isDnsNotFoundError(error)) {
      disableUpstash(error);
    } else {
      logger.error({ error }, "Upstash rate-limit check failed");
    }
    return null;
  }
}

async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  if (!ioRedisClient) return null;

  try {
    const requests = await ioRedisClient.incr(key);
    if (requests === 1) {
      await ioRedisClient.expire(key, windowSeconds);
    }
    const ttl = await ioRedisClient.ttl(key);
    return toRateLimitResult(requests, limit, resetFromTtl(ttl, windowSeconds));
  } catch (error) {
    logger.error({ error }, "Redis rate-limit check failed");
    return null;
  }
}

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  trimMemoryStore(now);

  const record = memoryStore.get(key);
  const resetAt = now + windowSeconds * 1000;

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt });
    return toRateLimitResult(1, limit, resetAt);
  }

  record.count += 1;
  return toRateLimitResult(record.count, limit, record.resetAt);
}

export async function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS
): Promise<RateLimitResult> {
  const normalizedLimit = normalizePositiveInteger(limit, DEFAULT_LIMIT);
  const normalizedWindowSeconds = normalizePositiveInteger(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  const key = buildRateLimitKey(identifier);

  const rustResult = await checkRateLimitWithRust({
    key,
    limit: normalizedLimit,
    windowSeconds: normalizedWindowSeconds,
  });
  if (rustResult) {
    return {
      success: rustResult.success,
      limit: rustResult.limit,
      remaining: rustResult.remaining,
      reset: Date.now() + normalizedWindowSeconds * 1000,
    };
  }

  const upstashResult = await checkUpstashRateLimit(
    key,
    normalizedLimit,
    normalizedWindowSeconds
  );
  if (upstashResult) return upstashResult;

  const redisResult = await checkRedisRateLimit(
    key,
    normalizedLimit,
    normalizedWindowSeconds
  );
  if (redisResult) return redisResult;

  return checkMemoryRateLimit(key, normalizedLimit, normalizedWindowSeconds);
}
