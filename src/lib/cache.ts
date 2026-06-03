// src/lib/cache.ts
// Redis (Upstash) + in-memory fallback when Redis is not configured.

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const MEMORY_MAX_ENTRIES = 400;
const memoryStore = new Map<string, { payload: string; expiresAt: number }>();

function isRedisConfigured(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

function pruneMemoryStore(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key);
  }
  if (memoryStore.size <= MEMORY_MAX_ENTRIES) return;
  const overflow = memoryStore.size - MEMORY_MAX_ENTRIES;
  const keys = memoryStore.keys();
  for (let i = 0; i < overflow; i += 1) {
    const next = keys.next();
    if (next.done) break;
    memoryStore.delete(next.value);
  }
}

async function redisRequest(command: string, ...args: (string | number)[]) {
  const res = await fetch(`${REDIS_URL}/${command}/${args.join("/")}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result;
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (isRedisConfigured()) {
    try {
      const val = await redisRequest("get", key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch {
      // fall through to memory
    }
  }

  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.payload) as T;
  } catch {
    memoryStore.delete(key);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const serialized = JSON.stringify(value);

  if (isRedisConfigured()) {
    try {
      await redisRequest(
        "set",
        key,
        encodeURIComponent(serialized),
        "ex",
        ttlSeconds
      );
      return;
    } catch {
      // fall through to memory
    }
  }

  pruneMemoryStore();
  memoryStore.set(key, {
    payload: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function deleteCached(key: string): Promise<void> {
  memoryStore.delete(key);
  if (!isRedisConfigured()) return;
  try {
    await redisRequest("del", key);
  } catch {
    // optional
  }
}

export const CacheKeys = {
  analysis: (sport: string, matchId: string) => `analysis:v2:${sport}:${matchId}`,
  upcomingMatches: (sport: string) => `matches:upcoming:${sport}`,
  liveMatches: (sport: string) => `matches:live:${sport}`,
  dailyUsage: (userId: string, date: string) => `usage:${userId}:${date}`,
  payosOrder: (orderCode: number) => `payos:order:${orderCode}`,
};
