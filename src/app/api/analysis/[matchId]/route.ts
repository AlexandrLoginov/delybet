import { NextRequest, NextResponse } from "next/server";
import { analyzeMatch } from "@/lib/ai-analysis";
import { getMockAnalysis } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const sport = req.nextUrl.searchParams.get("sport") ?? "football";
    const isPro = req.nextUrl.searchParams.get("pro") === "true";

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
          outcome: analysis.recommendation.outcome,
          confidence: "HIDDEN",
          reasoning: null,
          scenarios: analysis.recommendation.scenarios?.map((s) => ({
            kind: s.kind,
            label: s.label,
            pick: s.pick,
            probability: s.probability ?? null,
            confidence: "HIDDEN" as const,
            reasoning: null,
          })),
        },
        isPro: false,
        upgradeUrl: "/upgrade",
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
