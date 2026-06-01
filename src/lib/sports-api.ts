// src/lib/sports-api.ts
// Клиент API-Football (api-sports.io)

import axios, { isAxiosError } from "axios";

import { getCached, setCached, CacheKeys } from "./cache";
import {
  apiFootballSeasonYear,
  apiSportsKey,
  footballLeagueIds,
  upcomingMatchesDaysAhead,
} from "./integrations-config";

const BASE_URL = "https://v3.football.api-sports.io";

function headers(): Record<string, string> {
  const key = apiSportsKey();
  if (!key) {
    throw new Error("API_SPORTS_KEY is not set");
  }
  return { "x-apisports-key": key };
}

export class SportsApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number
  ) {
    super(message);
    this.name = "SportsApiError";
  }
}

// ── Типы ──────────────────────────────────────────────────────────────────────

export interface RawMatch {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { name: string; city: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
}

export interface MatchStats {
  possession: { home: string; away: string };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  xg: { home: number; away: number } | null;
}

export interface TeamFormEntry {
  result: "W" | "D" | "L";
  opponent: string;
  score: string;
}

export interface TeamForm {
  teamId: number;
  lastFive: ("W" | "D" | "L")[];
  goalsScored: number;
  goalsConceded: number;
  entries: TeamFormEntry[];
}

interface ApiFootballEnvelope<T> {
  response?: T;
  errors?: Record<string, string> | string[];
  message?: string;
}

interface StatisticRow {
  type: string;
  value: string | number | null;
}

interface FixtureStatisticsTeam {
  team: { id: number; name: string };
  statistics: StatisticRow[];
}

interface NewsArticle {
  title: string;
  description?: string;
  url?: string;
  source?: { name?: string };
}

function formatDateYmd(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function footballGet<T>(
  path: string,
  params: Record<string, string | number>,
  cacheKey: string | null,
  ttlSeconds: number
): Promise<T> {
  if (cacheKey) {
    const cached = await getCached<T>(cacheKey);
    if (cached != null) return cached;
  }

  try {
    const { data } = await axios.get<ApiFootballEnvelope<T>>(`${BASE_URL}${path}`, {
      headers: headers(),
      params,
      timeout: 20_000,
    });

    if (data.errors && Object.keys(data.errors).length > 0) {
      const errText =
        typeof data.errors === "object" && !Array.isArray(data.errors)
          ? Object.values(data.errors).join("; ")
          : String(data.errors);
      throw new SportsApiError(errText || "API-Football error");
    }

    const result = (data.response ?? []) as T;
    if (cacheKey) {
      await setCached(cacheKey, result, ttlSeconds);
    }
    return result;
  } catch (error) {
    if (error instanceof SportsApiError) throw error;
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const msg =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      throw new SportsApiError(
        status === 401 || status === 403
          ? "Неверный или просроченный API_SPORTS_KEY"
          : msg,
        status
      );
    }
    throw error;
  }
}

function statValue(arr: StatisticRow[], type: string): string | number {
  const row = arr.find((s) => s.type === type);
  const v = row?.value;
  if (v === null || v === undefined) return 0;
  return v;
}

function parsePercentStat(v: string | number): string {
  if (typeof v === "string" && v.includes("%")) return v;
  const n = typeof v === "number" ? v : parseInt(String(v).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? `${n}%` : "50%";
}

function parseIntStat(v: string | number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildFormEntries(teamId: number, matches: RawMatch[]): TeamFormEntry[] {
  return matches.map((m) => {
    const isHome = m.teams.home.id === teamId;
    const us = isHome ? m.teams.home : m.teams.away;
    const them = isHome ? m.teams.away : m.teams.home;
    const gf = isHome ? m.goals.home : m.goals.away;
    const ga = isHome ? m.goals.away : m.goals.home;
    let result: "W" | "D" | "L" = "D";
    if (us.winner === true) result = "W";
    else if (us.winner === false) result = "L";
    const score =
      gf != null && ga != null ? `${gf}:${ga}` : "—";
    return {
      result,
      opponent: them.name,
      score,
    };
  });
}

// ── Матчи ─────────────────────────────────────────────────────────────────────

const UPCOMING_STATUS = new Set(["NS", "TBD", "PST"]);

function isUpcomingFixture(raw: RawMatch): boolean {
  return UPCOMING_STATUS.has(raw.fixture.status.short);
}

function matchesLeagueFilter(raw: RawMatch, leagueIds: number[] | undefined): boolean {
  if (!leagueIds?.length) return true;
  return leagueIds.includes(raw.league.id);
}

export async function getUpcomingMatches(
  _sport = "football",
  leagueIds?: number[]
): Promise<RawMatch[]> {
  const leagues = leagueIds ?? footballLeagueIds();
  const daysAhead = upcomingMatchesDaysAhead();
  const today = new Date();
  const seen = new Set<number>();
  const merged: RawMatch[] = [];

  /** Free tier: `date=` работает; `from/to/status` без league часто отклоняется. */
  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const dateStr = formatDateYmd(addDays(today, offset));
    const cacheKey = CacheKeys.upcomingMatches(
      `football:date:${dateStr}:${leagues?.join("-") ?? "all"}`
    );

    const rows = await footballGet<RawMatch[]>(
      "/fixtures",
      { date: dateStr },
      cacheKey,
      900
    );

    for (const row of rows) {
      if (seen.has(row.fixture.id)) continue;
      if (!isUpcomingFixture(row)) continue;
      if (!matchesLeagueFilter(row, leagues)) continue;
      seen.add(row.fixture.id);
      merged.push(row);
    }
  }

  return merged.sort(
    (a, b) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
}

export async function getLiveMatches(_sport = "football"): Promise<RawMatch[]> {
  const cacheKey = CacheKeys.liveMatches("football");
  return footballGet<RawMatch[]>(
    "/fixtures",
    { live: "all" },
    cacheKey,
    120
  );
}

export async function getMatchById(fixtureId: number): Promise<RawMatch | null> {
  const cacheKey = `fixture:${fixtureId}`;
  const rows = await footballGet<RawMatch[]>(
    "/fixtures",
    { id: fixtureId },
    cacheKey,
    60
  );
  return rows[0] ?? null;
}

// ── Статистика ────────────────────────────────────────────────────────────────

export async function getMatchStats(
  fixtureId: number
): Promise<MatchStats | null> {
  const cacheKey = `fixture:stats:${fixtureId}`;
  const stats = await footballGet<FixtureStatisticsTeam[]>(
    "/fixtures/statistics",
    { fixture: fixtureId },
    cacheKey,
    120
  );

  if (!stats?.length) return null;

  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];

  return {
    possession: {
      home: parsePercentStat(statValue(home, "Ball Possession")),
      away: parsePercentStat(statValue(away, "Ball Possession")),
    },
    shots: {
      home: parseIntStat(statValue(home, "Total Shots")),
      away: parseIntStat(statValue(away, "Total Shots")),
    },
    shotsOnTarget: {
      home: parseIntStat(statValue(home, "Shots on Goal")),
      away: parseIntStat(statValue(away, "Shots on Goal")),
    },
    corners: {
      home: parseIntStat(statValue(home, "Corner Kicks")),
      away: parseIntStat(statValue(away, "Corner Kicks")),
    },
    xg: null,
  };
}

// ── Форма команды ─────────────────────────────────────────────────────────────

export async function getTeamForm(
  teamId: number,
  leagueId: number,
  season?: number
): Promise<TeamForm> {
  const seasonYear = season ?? apiFootballSeasonYear();
  const cacheKey = `team:form:${teamId}:${leagueId}:${seasonYear}`;

  const allMatches = await footballGet<RawMatch[]>(
    "/fixtures",
    { team: teamId, league: leagueId, season: seasonYear },
    cacheKey,
    3600
  );

  const finishedStatuses = new Set(["FT", "AET", "PEN"]);
  const matches = allMatches
    .filter((m) => finishedStatuses.has(m.fixture.status.short))
    .sort(
      (a, b) =>
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
    )
    .slice(0, 5);

  const entries = buildFormEntries(teamId, matches);
  const lastFive = entries.map((e) => e.result);

  const goalsScored = matches.reduce((acc, m) => {
    const isHome = m.teams.home.id === teamId;
    return acc + (isHome ? m.goals.home ?? 0 : m.goals.away ?? 0);
  }, 0);

  const goalsConceded = matches.reduce((acc, m) => {
    const isHome = m.teams.home.id === teamId;
    return acc + (isHome ? m.goals.away ?? 0 : m.goals.home ?? 0);
  }, 0);

  return { teamId, lastFive, goalsScored, goalsConceded, entries };
}

// ── Новости через News API ────────────────────────────────────────────────────

export async function getMatchNews(
  homeTeam: string,
  awayTeam: string
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY?.trim();
  if (!apiKey) return [];

  const query = encodeURIComponent(
    `"${homeTeam}" OR "${awayTeam}" football`
  );
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en,ru&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

  try {
    const { data } = await axios.get<{ articles?: NewsArticle[] }>(url, {
      timeout: 12_000,
    });
    return data.articles ?? [];
  } catch {
    return [];
  }
}
