import { redis } from "./redis";

// In-memory fallback for when Redis isn't configured (dev / no REDIS_URL)
const memStore = new Map<string, { count: number; resetAt: number }>();

// Clean up stale in-memory entries every 5 minutes so memory doesn't grow forever
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of memStore) {
      if (val.resetAt < now) memStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check whether a key is within the allowed rate limit.
 *
 * @param key       Unique key, e.g. `tutor:userId`
 * @param limit     Max requests allowed in the window
 * @param windowSec Window duration in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        // First request in window — set expiry
        await redis.expire(redisKey, windowSec);
      }
      const ttl = await redis.ttl(redisKey);
      const allowed = count <= limit;
      return { allowed, remaining: Math.max(0, limit - count), resetIn: ttl };
    } catch {
      // Redis error — fail open so the app keeps working
      return { allowed: true, remaining: limit, resetIn: windowSec };
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1, resetIn: windowSec };
  }
  entry.count++;
  const allowed = entry.count <= limit;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed, remaining: Math.max(0, limit - entry.count), resetIn };
}
