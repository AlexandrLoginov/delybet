import { NextRequest, NextResponse } from "next/server";

import { getCached, setCached } from "@/lib/cache";
import { MOCK_MATCHES } from "@/lib/mock-data";
import { rawMatchToMatch } from "@/lib/match-mapper";
import { getLiveMatches, getUpcomingMatches } from "@/lib/sports-api";
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

export async function GET(req: NextRequest) {
  const tab =
    req.nextUrl.searchParams.get("tab") === "live" ? "live" : "upcoming";
  const sport = req.nextUrl.searchParams.get("sport") ?? "all";

  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.API_SPORTS_KEY;

  if (useMocks) {
    return NextResponse.json({ matches: filterMock(tab, sport) });
  }

  const cacheKey = `matches:list:football:${tab}`;
  const cached = await getCached<Match[]>(cacheKey);
  if (cached?.length) {
    return NextResponse.json({ matches: filterCachedSport(cached, sport) });
  }

  try {
    const raw =
      tab === "live"
        ? await getLiveMatches("football")
        : await getUpcomingMatches("football");
    const mapped = raw.map(rawMatchToMatch);
    await setCached(cacheKey, mapped, 120);
    return NextResponse.json({ matches: filterCachedSport(mapped, sport) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "MATCHES_FETCH_FAILED", message },
      { status: 502 }
    );
  }
}

function filterCachedSport(matches: Match[], sport: string): Match[] {
  if (sport === "all") return matches;
  if (sport === "football") return matches.filter((m) => m.sport === "football");
  return [];
}
