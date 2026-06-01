/** Ключ api-sports.io / API-Football (один провайдер). */
export function apiSportsKey(): string | null {
  const key =
    process.env.API_SPORTS_KEY?.trim() ||
    process.env.API_FOOTBALL_KEY?.trim() ||
    null;
  return key || null;
}

export function isApiSportsConfigured(): boolean {
  return Boolean(apiSportsKey());
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isNewsApiConfigured(): boolean {
  return Boolean(process.env.NEWS_API_KEY?.trim());
}

/** Список матчей с API-Sports (без моков). */
export function isLiveSportsDataEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") return false;
  return isApiSportsConfigured();
}

/** ИИ-анализ через Anthropic (данные матча — API-Football или демо-список). */
export function isLiveAnalysisEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") return false;
  return isAnthropicConfigured();
}

/** Откуда берутся данные для промпта перед вызовом Anthropic. */
export function analysisMatchDataSource(): "api-football" | "mock-fixtures" | null {
  if (!isLiveAnalysisEnabled()) return null;
  if (isApiSportsConfigured()) return "api-football";
  return "mock-fixtures";
}

/** Опциональный фильтр лиг: `39,140,135` (ID API-Football). Пусто — все лиги в ответе API. */
export function footballLeagueIds(): number[] | undefined {
  const raw = process.env.API_FOOTBALL_LEAGUE_IDS?.trim();
  if (!raw) return undefined;
  const ids = raw
    .split(/[,\s]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return ids.length > 0 ? ids : undefined;
}

export function apiFootballSeasonYear(): number {
  const raw = process.env.API_FOOTBALL_SEASON?.trim();
  if (raw && /^\d{4}$/.test(raw)) return parseInt(raw, 10);
  return new Date().getFullYear();
}

/** Сколько дней вперёд запрашивать предстоящие матчи (1–14). */
export function upcomingMatchesDaysAhead(): number {
  const raw = process.env.API_FOOTBALL_UPCOMING_DAYS?.trim();
  const n = raw ? parseInt(raw, 10) : 3;
  if (!Number.isFinite(n)) return 3;
  return Math.min(14, Math.max(1, n));
}
