import { Redis } from "@upstash/redis";
import RedisIO from "ioredis";
import { checkRateLimitWithRust } from "@/server/services/hotpath-client";

// Support both Upstash (HTTP) and standard Redis (TCP)
// Priority: UPSTASH_REDIS_REST_URL -> REDIS_URL -> In-Memory

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let upstashClient: Redis | null = null;
let ioRedisClient: RedisIO | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  upstashClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else if (process.env.REDIS_URL) {
  ioRedisClient = new RedisIO(process.env.REDIS_URL);
}

// In-memory fallback
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for a given identifier (IP or UserId)
 * @param identifier Unique key (e.g., "post_create:user_123")
 * @param limit Max requests
 * @param windowSeconds Time window in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;

  // 0. Rust edge rate limiter (primary path)
  const rustResult = await checkRateLimitWithRust({
    key,
    limit,
    windowSeconds,
  });
  if (rustResult) {
    return {
      success: rustResult.success,
      limit: rustResult.limit,
      remaining: rustResult.remaining,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
  
  // 1. Upstash Redis (HTTP)
  if (upstashClient) {
    try {
      // Use a simple counter with expiration
      const requests = await upstashClient.incr(key);
      if (requests === 1) {
        await upstashClient.expire(key, windowSeconds);
      }
      const ttl = await upstashClient.ttl(key);
      
      return {
        success: requests <= limit,
        limit,
        remaining: Math.max(0, limit - requests),
        reset: Date.now() + (ttl * 1000),
      };
    } catch (err) {
      console.error("Redis rate limit error:", err);
      // Fallback to memory if Redis fails
    }
  }
  
  // 2. Standard Redis (TCP)
  if (ioRedisClient) {
    try {
      const requests = await ioRedisClient.incr(key);
      if (requests === 1) {
        await ioRedisClient.expire(key, windowSeconds);
      }
      const ttl = await ioRedisClient.ttl(key);
      
      return {
        success: requests <= limit,
        limit,
        remaining: Math.max(0, limit - requests),
        reset: Date.now() + (ttl * 1000),
      };
    } catch (err) {
      console.error("Redis rate limit error:", err);
    }
  }

  // 3. In-Memory Fallback
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + (windowSeconds * 1000),
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + (windowSeconds * 1000),
    };
  }

  record.count++;
  return {
    success: record.count <= limit,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.resetAt,
  };
}


