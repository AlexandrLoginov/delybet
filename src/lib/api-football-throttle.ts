/** Лимит free tier API-Football: 10 req/min — держим запас. */
const MAX_CALLS_PER_MINUTE = 8;
const WINDOW_MS = 60_000;

const recentCalls: number[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForApiFootballSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (recentCalls.length > 0 && now - recentCalls[0]! >= WINDOW_MS) {
      recentCalls.shift();
    }

    if (recentCalls.length < MAX_CALLS_PER_MINUTE) {
      recentCalls.push(now);
      return;
    }

    const waitMs = WINDOW_MS - (now - recentCalls[0]!) + 150;
    await sleep(Math.min(waitMs, WINDOW_MS));
  }
}

export function apiFootballRateLimitMessage(): string {
  return "Слишком много запросов к спортивному API. Подождите минуту и нажмите «Повторить».";
}

export function isApiFootballRateLimit(
  statusCode?: number,
  message?: string
): boolean {
  if (statusCode === 429) return true;
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("too many requests") ||
    lower.includes("rate limit")
  );
}
