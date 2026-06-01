import { NextRequest, NextResponse } from "next/server";

import { CacheKeys } from "@/lib/cache";
import { isLiveSportsDataEnabled } from "@/lib/integrations-config";
import { MOCK_MATCHES } from "@/lib/mock-data";
import { rawMatchToMatch } from "@/lib/match-mapper";
import { getLiveMatches, getUpcomingMatches, SportsApiError } from "@/lib/sports-api";
import type { Match } from "@/types/match";

export const dynamic = "force-dynamic";

function filterMock(tab: "upcoming" | "live", sport: string): Match[] {
  let rows = MOCK_MATCHES.filter((m) =>
    tab === "live" ? m.status === "live" : m.status === "upcoming"
  );
  if (sport !== "all") {
    rows = rows.filter((m) => m.sport === sport);
  }
  return rows;
}

function filterCachedSport(matches: Match[], sport: string): Match[] {
  if (sport === "all") return matches;
  if (sport === "football") return matches.filter((m) => m.sport === "football");
  return [];
}

export async function GET(req: NextRequest) {
  const tab =
    req.nextUrl.searchParams.get("tab") === "live" ? "live" : "upcoming";
  const sport = req.nextUrl.searchParams.get("sport") ?? "all";

  if (!isLiveSportsDataEnabled()) {
    return NextResponse.json({
      matches: filterMock(tab, sport),
      source: "mock" as const,
    });
  }

  try {
    const raw =
      tab === "live"
        ? await getLiveMatches("football")
        : await getUpcomingMatches("football");
    const mapped = raw.map(rawMatchToMatch);
    return NextResponse.json({
      matches: filterCachedSport(mapped, sport),
      source: "api" as const,
      cacheHint: tab === "live" ? CacheKeys.liveMatches("football") : "upcoming",
    });
  } catch (error) {
    const message =
      error instanceof SportsApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";
    const status =
      error instanceof SportsApiError && error.statusCode === 401
        ? 503
        : 502;
    return NextResponse.json(
      { error: "MATCHES_FETCH_FAILED", message },
      { status }
    );
  }
}
