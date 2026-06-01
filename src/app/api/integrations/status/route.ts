import { NextResponse } from "next/server";

import {
  analysisMatchDataSource,
  apiFootballSeasonYear,
  footballLeagueIds,
  isAnthropicConfigured,
  isApiSportsConfigured,
  isNewsApiConfigured,
  upcomingMatchesDaysAhead,
  isLiveAnalysisEnabled,
  isLiveSportsDataEnabled,
} from "@/lib/integrations-config";

export const dynamic = "force-dynamic";

/** Диагностика внешних API (без секретов). */
export async function GET() {
  return NextResponse.json({
    mocksForced: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
    sports: {
      configured: isApiSportsConfigured(),
      liveData: isLiveSportsDataEnabled(),
      season: apiFootballSeasonYear(),
      leagueIds: footballLeagueIds() ?? null,
      upcomingDays: upcomingMatchesDaysAhead(),
      listPath: "/api/matches",
    },
    analysis: {
      anthropic: isAnthropicConfigured(),
      modelConfigured: Boolean(process.env.ANTHROPIC_MODEL?.trim()),
      liveAnalysis: isLiveAnalysisEnabled(),
      matchDataSource: analysisMatchDataSource(),
      pathTemplate: "/api/analysis/:matchId?sport=football",
    },
    news: { configured: isNewsApiConfigured() },
    redis: {
      configured: Boolean(
        process.env.UPSTASH_REDIS_REST_URL?.trim() &&
          process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
      ),
    },
  });
}
