import type { RawMatch } from "@/lib/sports-api";
import type { Match, Team } from "@/types/match";

const LIVE_SHORT = new Set([
  "1H",
  "2H",
  "HT",
  "ET",
  "P",
  "BT",
  "INT",
  "LIVE",
]);

function pickTeamColor(id: number): string {
  const hex = ((id * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(-6);
  return `#${hex}`;
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 3).toUpperCase();
  return parts
    .slice(0, 3)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

function teamFromApiSide(
  side: RawMatch["teams"]["home"],
  color: string
): Team {
  return {
    id: side.id,
    name: side.name,
    shortName: shortName(side.name),
    logoColor: color,
    logoUrl: side.logo?.startsWith("http") ? side.logo : "",
  };
}

/** Преобразование ответа API-Football в доменную модель матча (только футбол). */
export function rawMatchToMatch(raw: RawMatch): Match {
  const short = raw.fixture.status.short;
  const isLive = LIVE_SHORT.has(short);
  const isFinished = ["FT", "AET", "PEN"].includes(short);

  const status: Match["status"] = isLive
    ? "live"
    : isFinished
      ? "finished"
      : "upcoming";

  const venueName = raw.fixture.venue?.name;
  const venue =
    venueName && venueName !== "null" && venueName.length > 0
      ? venueName
      : undefined;

  return {
    id: String(raw.fixture.id),
    sport: "football",
    league: raw.league.name,
    country: raw.league.country,
    round: raw.league.round?.trim() || "Тур",
    venue,
    kickoffISO: raw.fixture.date,
    status,
    elapsedMinutes:
      isLive && raw.fixture.status.elapsed != null
        ? raw.fixture.status.elapsed
        : undefined,
    home: teamFromApiSide(raw.teams.home, pickTeamColor(raw.teams.home.id)),
    away: teamFromApiSide(raw.teams.away, pickTeamColor(raw.teams.away.id)),
    scoreHome:
      raw.goals.home != null ? raw.goals.home : isLive || isFinished ? 0 : undefined,
    scoreAway:
      raw.goals.away != null ? raw.goals.away : isLive || isFinished ? 0 : undefined,
  };
}
