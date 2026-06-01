import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { analyzeMatch } from "@/lib/ai-analysis";
import {
  SESSION_COOKIE,
  verifySessionPayload,
} from "@/lib/auth-session";
import { forceMockData, isLiveAnalysisEnabled } from "@/lib/integrations-config";
import { UI_PREVIEW_PRO_COOKIE } from "@/lib/ui-preview-pro-cookie";
import { getMockAnalysis } from "@/lib/mock-data";
import {
  checkDailyLimit,
  checkSubscription,
  incrementUsage,
} from "@/lib/subscription";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";

export const dynamic = "force-dynamic";

function usageTypeFromMatchStatus(
  status: string | null
): "upcoming" | "live" | null {
  if (status === "live") return "live";
  if (status === "upcoming") return "upcoming";
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const sport = req.nextUrl.searchParams.get("sport") ?? "football";
    const matchStatus = req.nextUrl.searchParams.get("status");

    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
    const sessionPayload = sessionToken
      ? verifySessionPayload(sessionToken)
      : null;
    const sessionUserId = sessionPayload?.sub ?? null;

    let dbPro = false;
    if (sessionUserId) {
      dbPro = await checkSubscription(sessionUserId);
    }

    const devToolsBypass =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
    const wantsClientPro =
      req.nextUrl.searchParams.get("pro") === "true";

    const uiPreviewCookie =
      cookieStore.get(UI_PREVIEW_PRO_COOKIE)?.value === "1";
    const uiPreviewPro =
      Boolean(sessionUserId) &&
      uiPreviewCookie &&
      wantsClientPro &&
      isProfileAdminTelegramUsername(sessionPayload?.tg);

    const isPro =
      dbPro || uiPreviewPro || (devToolsBypass && wantsClientPro);

    const useMock = forceMockData() || !isLiveAnalysisEnabled();

    if (!useMock && !isPro && sessionUserId) {
      const usageType = usageTypeFromMatchStatus(matchStatus);
      if (usageType) {
        const limit = await checkDailyLimit(sessionUserId, usageType);
        if (!limit.allowed) {
          return NextResponse.json(
            {
              error: "DAILY_LIMIT",
              used: limit.used,
              limit: limit.limit,
              type: usageType,
              upgradeUrl: "/subscription",
            },
            { status: 402 }
          );
        }
      }
    }

    const analysis = useMock
      ? getMockAnalysis(matchId)
      : await analyzeMatch(matchId, sport, isPro);

    if (!useMock && !isPro && sessionUserId) {
      const usageType = usageTypeFromMatchStatus(matchStatus);
      if (usageType) {
        await incrementUsage(sessionUserId, usageType);
      }
    }

    const dataSource = useMock ? ("mock" as const) : ("api" as const);

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
        dataSource,
        upgradeUrl: "/subscription",
      });
    }

    return NextResponse.json({ ...analysis, isPro: true, dataSource });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "ANALYSIS_FAILED", message },
      { status: 500 }
    );
  }
}
