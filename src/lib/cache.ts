/**
 * Unified cache with Redis support and in-memory fallback
 * 
 * Priority:
 * 1. Upstash Redis (HTTP) - best for serverless
 * 2. Standard Redis (TCP) - for traditional servers
 * 3. In-Memory fallback - for local dev or when Redis unavailable
 */

import { Redis } from "@upstash/redis";
import RedisIO from "ioredis";

// Initialize Redis clients
let upstashClient: Redis | null = null;
let ioRedisClient: RedisIO | null = null;

// Upstash Redis (HTTP-based, ideal for serverless)
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log("[Cache] Using Upstash Redis");
    }
  } catch (e) {
    console.error("[Cache] Failed to initialize Upstash Redis:", e);
  }
} 
// Standard Redis (TCP-based)
else if (process.env.REDIS_URL) {
  try {
    ioRedisClient = new RedisIO(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log("[Cache] Using standard Redis");
    }
  } catch (e) {
    console.error("[Cache] Failed to initialize Redis:", e);
  }
}

if (!upstashClient && !ioRedisClient && process.env.NODE_ENV === 'development') {
  console.log("[Cache] Using in-memory cache (not recommended for production)");
}

// In-memory cache for fallback
interface MemoryCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();
const memoryTimers = new Map<string, NodeJS.Timeout>();

class ResponseCache {
  /**
   * Set a value in cache with TTL
   */
  async set<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
    // Upstash Redis
    if (upstashClient) {
      try {
        await upstashClient.set(key, JSON.stringify(data), { ex: ttlSeconds });
        return;
      } catch (e) {
        console.error("[Cache] Upstash set error:", e);
        // Fall through to memory cache
      }
    }

    // Standard Redis
    if (ioRedisClient) {
      try {
        await ioRedisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
        return;
      } catch (e) {
        console.error("[Cache] Redis set error:", e);
        // Fall through to memory cache
      }
    }

    // In-memory fallback
    const existingTimer = memoryTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { data, expiresAt });

    const timer = setTimeout(() => {
      memoryCache.delete(key);
      memoryTimers.delete(key);
    }, ttlSeconds * 1000);

    memoryTimers.set(key, timer);
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Upstash Redis
    if (upstashClient) {
      try {
        const data = await upstashClient.get(key);
        if (data === null) return null;
        return typeof data === 'string' ? JSON.parse(data) : data as T;
      } catch (e) {
        console.error("[Cache] Upstash get error:", e);
        // Fall through to memory cache
      }
    }

    // Standard Redis
    if (ioRedisClient) {
      try {
        const data = await ioRedisClient.get(key);
        if (data === null) return null;
        return JSON.parse(data) as T;
      } catch (e) {
        console.error("[Cache] Redis get error:", e);
        // Fall through to memory cache
      }
    }

    // In-memory fallback
    const entry = memoryCache.get(key) as MemoryCacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      const timer = memoryTimers.get(key);
      if (timer) clearTimeout(timer);
      memoryTimers.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  /**
   * Delete a specific key
   */
  async delete(key: string): Promise<void> {
    // Upstash Redis
    if (upstashClient) {
      try {
        await upstashClient.del(key);
      } catch (e) {
        console.error("[Cache] Upstash delete error:", e);
      }
    }

    // Standard Redis
    if (ioRedisClient) {
      try {
        await ioRedisClient.del(key);
      } catch (e) {
        console.error("[Cache] Redis delete error:", e);
      }
    }

    // Always clear from memory too
    memoryCache.delete(key);
    const timer = memoryTimers.get(key);
    if (timer) clearTimeout(timer);
    memoryTimers.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   * Note: Pattern matching is less efficient in Redis, use sparingly
   */
  async invalidatePattern(pattern: string | RegExp): Promise<void> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    // Upstash Redis - use SCAN for pattern matching
    if (upstashClient) {
      try {
        let cursor = 0;
        do {
          const [nextCursor, keys] = await upstashClient.scan(cursor, { count: 100 });
          cursor = Number(nextCursor);
          
          const keysToDelete = (keys as string[]).filter(key => regex.test(key));
          if (keysToDelete.length > 0) {
            await Promise.all(keysToDelete.map(key => upstashClient!.del(key)));
          }
        } while (cursor !== 0);
      } catch (e) {
        console.error("[Cache] Upstash invalidatePattern error:", e);
      }
    }

    // Standard Redis
    if (ioRedisClient) {
      try {
        const stream = ioRedisClient.scanStream({ count: 100 });
        const pipeline = ioRedisClient.pipeline();
        let count = 0;

        stream.on('data', (keys: string[]) => {
          const keysToDelete = keys.filter(key => regex.test(key));
          keysToDelete.forEach(key => {
            pipeline.del(key);
            count++;
          });
        });

        await new Promise<void>((resolve, reject) => {
          stream.on('end', async () => {
            if (count > 0) await pipeline.exec();
            resolve();
          });
          stream.on('error', reject);
        });
      } catch (e) {
        console.error("[Cache] Redis invalidatePattern error:", e);
      }
    }

    // In-memory fallback
    const keysToDelete: string[] = [];
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => {
      memoryCache.delete(key);
      const timer = memoryTimers.get(key);
      if (timer) clearTimeout(timer);
      memoryTimers.delete(key);
    });
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    // Upstash Redis
    if (upstashClient) {
      try {
        await upstashClient.flushdb();
      } catch (e) {
        console.error("[Cache] Upstash clear error:", e);
      }
    }

    // Standard Redis
    if (ioRedisClient) {
      try {
        await ioRedisClient.flushdb();
      } catch (e) {
        console.error("[Cache] Redis clear error:", e);
      }
    }

    // In-memory fallback
    memoryTimers.forEach(timer => clearTimeout(timer));
    memoryCache.clear();
    memoryTimers.clear();
  }

  /**
   * Get or set pattern - fetch from cache or compute and store
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Check if Redis is available (for diagnostics)
   */
  isRedisAvailable(): boolean {
    return upstashClient !== null || ioRedisClient !== null;
  }
}

export const responseCache = new ResponseCache();

export const cacheNamespaces = {
  query: "query",
  object: "object",
  feed: "feed",
  session: "session",
} as const;

export function namespacedCacheKey(
  namespace: keyof typeof cacheNamespaces,
  key: string
) {
  return `${cacheNamespaces[namespace]}:${key}`;
}

export async function getOrSetQueryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
) {
  return responseCache.getOrSet<T>(namespacedCacheKey("query", key), fetcher, ttlSeconds);
}

export async function getOrSetObjectCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
) {
  return responseCache.getOrSet<T>(namespacedCacheKey("object", key), fetcher, ttlSeconds);
}

export async function getOrSetFeedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 30
) {
  return responseCache.getOrSet<T>(namespacedCacheKey("feed", key), fetcher, ttlSeconds);
}

export async function setSessionCache<T>(key: string, value: T, ttlSeconds = 60 * 15) {
  return responseCache.set(namespacedCacheKey("session", key), value, ttlSeconds);
}
