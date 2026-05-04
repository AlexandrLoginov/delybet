import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { analyzeMatch } from "@/lib/ai-analysis";
import { SESSION_COOKIE, verifySession } from "@/lib/auth-session";
import { getMockAnalysis } from "@/lib/mock-data";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const sport = req.nextUrl.searchParams.get("sport") ?? "football";

    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
    const sessionUserId = sessionToken ? verifySession(sessionToken) : null;

    let dbPro = false;
    if (sessionUserId) {
      dbPro = await checkSubscription(sessionUserId);
    }

    const devToolsBypass =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
    const wantsClientPro =
      req.nextUrl.searchParams.get("pro") === "true";

    const isPro =
      dbPro || (devToolsBypass && wantsClientPro);

    const useMock =
      !process.env.ANTHROPIC_API_KEY ||
      !process.env.API_SPORTS_KEY ||
      process.env.NEXT_PUBLIC_USE_MOCKS === "true";

    const analysis = useMock
      ? getMockAnalysis(matchId)
      : await analyzeMatch(matchId, sport, isPro);

    if (!isPro) {
      return NextResponse.json({
        matchId: analysis.matchId,
        generatedAt: analysis.generatedAt,
        isLive: analysis.isLive,
        probabilities: analysis.probabilities,
        summary: analysis.summary,
        recommendation: {
          outcome: "",
          confidence: "HIDDEN",
          reasoning: null,
          scenarios: undefined,
        },
        isPro: false,
        upgradeUrl: "/subscription",
      });
    }

    return NextResponse.json({ ...analysis, isPro: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "ANALYSIS_FAILED", message },
      { status: 500 }
    );
  }
}
