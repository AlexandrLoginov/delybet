// src/lib/cache.ts
// Redis wrapper через Upstash (serverless, работает на Vercel)

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

async function redisRequest(command: string, ...args: (string | number)[]) {
  const res = await fetch(`${REDIS_URL}/${command}/${args.join("/")}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const val = await redisRequest("get", key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redisRequest("set", key, encodeURIComponent(serialized), "ex", ttlSeconds);
  } catch {
    // Кэш опционален — не ломаем приложение
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redisRequest("del", key);
  } catch {}
}

// Ключи кэша — централизованно
export const CacheKeys = {
  analysis: (sport: string, matchId: string) => `analysis:${sport}:${matchId}`,
  upcomingMatches: (sport: string) => `matches:upcoming:${sport}`,
  liveMatches: (sport: string) => `matches:live:${sport}`,
  dailyUsage: (userId: string, date: string) => `usage:${userId}:${date}`,
};
