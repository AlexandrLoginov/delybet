// src/lib/sports-api.ts
// Клиент для API-Football и API-Sports (api-sports.io)

import axios from "axios";

const BASE_URL = "https://v3.football.api-sports.io";
const SPORTS_URL = "https://v1.basketball.api-sports.io"; // аналогично для других видов

const headers = {
  "x-apisports-key": process.env.API_SPORTS_KEY!,
};

// ── Типы ──────────────────────────────────────────────────────────────────────

export interface RawMatch {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { name: string; city: string };
  };
  league: { id: number; name: string; country: string; logo: string; round: string };
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

export interface TeamForm {
  teamId: number;
  lastFive: ("W" | "D" | "L")[];
  goalsScored: number;
  goalsConceded: number;
}

// ── Матчи ─────────────────────────────────────────────────────────────────────

export async function getUpcomingMatches(sport = "football", leagueIds?: number[]): Promise<RawMatch[]> {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const params: Record<string, string> = { from: today, to: tomorrow, status: "NS" };
  if (leagueIds?.length) params.league = leagueIds.join("-");

  const { data } = await axios.get(`${BASE_URL}/fixtures`, { headers, params });
  return data.response ?? [];
}

export async function getLiveMatches(sport = "football"): Promise<RawMatch[]> {
  const { data } = await axios.get(`${BASE_URL}/fixtures`, {
    headers,
    params: { live: "all" },
  });
  return data.response ?? [];
}

export async function getMatchById(fixtureId: number): Promise<RawMatch | null> {
  const { data } = await axios.get(`${BASE_URL}/fixtures`, {
    headers,
    params: { id: fixtureId },
  });
  return data.response?.[0] ?? null;
}

// ── Статистика ────────────────────────────────────────────────────────────────

export async function getMatchStats(fixtureId: number): Promise<MatchStats | null> {
  const { data } = await axios.get(`${BASE_URL}/fixtures/statistics`, {
    headers,
    params: { fixture: fixtureId },
  });

  const stats = data.response;
  if (!stats?.length) return null;

  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];

  const get = (arr: any[], type: string) =>
    arr.find((s: any) => s.type === type)?.value ?? 0;

  return {
    possession: {
      home: get(home, "Ball Possession") || "50%",
      away: get(away, "Ball Possession") || "50%",
    },
    shots: {
      home: get(home, "Total Shots"),
      away: get(away, "Total Shots"),
    },
    shotsOnTarget: {
      home: get(home, "Shots on Goal"),
      away: get(away, "Shots on Goal"),
    },
    corners: {
      home: get(home, "Corner Kicks"),
      away: get(away, "Corner Kicks"),
    },
    xg: null, // xG доступен в отдельном эндпоинте на Pro плане API
  };
}

// ── Форма команды ─────────────────────────────────────────────────────────────

export async function getTeamForm(teamId: number, leagueId: number, season: number): Promise<TeamForm> {
  const { data } = await axios.get(`${BASE_URL}/fixtures`, {
    headers,
    params: { team: teamId, league: leagueId, season, last: 5 },
  });

  const matches: RawMatch[] = data.response ?? [];

  const form = matches.map((m) => {
    const isHome = m.teams.home.id === teamId;
    const winner = m.teams[isHome ? "home" : "away"].winner;
    if (winner === true) return "W" as const;
    if (winner === false) return "L" as const;
    return "D" as const;
  });

  const goalsScored = matches.reduce((acc, m) => {
    const isHome = m.teams.home.id === teamId;
    return acc + (isHome ? m.goals.home ?? 0 : m.goals.away ?? 0);
  }, 0);

  const goalsConceded = matches.reduce((acc, m) => {
    const isHome = m.teams.home.id === teamId;
    return acc + (isHome ? m.goals.away ?? 0 : m.goals.home ?? 0);
  }, 0);

  return { teamId, lastFive: form, goalsScored, goalsConceded };
}

// ── Новости через News API ────────────────────────────────────────────────────

export async function getMatchNews(homeTeam: string, awayTeam: string): Promise<any[]> {
  const query = encodeURIComponent(`${homeTeam} OR ${awayTeam} football`);
  const url = `https://newsapi.org/v2/everything?q=${query}&language=ru,en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    const { data } = await axios.get(url);
    return data.articles ?? [];
  } catch {
    return [];
  }
}
