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
  return isApiSportsConfigured();
}

/** ИИ-анализ через Anthropic (данные матча — API-Football или демо-список). */
export function isLiveAnalysisEnabled(): boolean {
  return isAnthropicConfigured();
}

/** Явный режим демо-данных (перебивает API даже при наличии ключей). */
export function forceMockData(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

/** Откуда берутся данные для промпта перед вызовом Anthropic. */
export function analysisMatchDataSource(): "api-football" | "mock-fixtures" | null {
  if (!isLiveAnalysisEnabled()) return null;
  if (isApiSportsConfigured()) return "api-football";
  return "mock-fixtures";
}

/** Фильтр лиг. Пустой массив = все лиги из ответа API. */
export function footballLeagueIds(): number[] {
  const raw = process.env.API_FOOTBALL_LEAGUE_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function apiFootballSeasonYear(): number {
  const raw = process.env.API_FOOTBALL_SEASON?.trim();
  if (raw && /^\d{4}$/.test(raw)) return parseInt(raw, 10);
  /** Free tier API-Football: доступны сезоны 2022–2024. На Pro задайте API_FOOTBALL_SEASON. */
  return 2024;
}

/** Сколько дней вперёд запрашивать предстоящие матчи (1–14). */
export function upcomingMatchesDaysAhead(): number {
  const raw = process.env.API_FOOTBALL_UPCOMING_DAYS?.trim();
  const n = raw ? parseInt(raw, 10) : 3;
  if (!Number.isFinite(n)) return 3;
  return Math.min(14, Math.max(1, n));
}
