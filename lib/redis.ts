import Redis from "ioredis";

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  redis.on("error", (err: Error) => {
    // Log but don't crash — app works without Redis
    console.error("[Redis]", err.message);
  });
}

export { redis };
