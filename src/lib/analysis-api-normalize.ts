import type { FullAnalysis } from "@/types/analysis";

/** Приводит ответ GET /api/analysis/[id] к FullAnalysis (в т.ч. урезанный Free-ответ). */
export function normalizeAnalysisPayload(data: unknown): FullAnalysis {
  if (!data || typeof data !== "object") {
    throw new Error("INVALID_ANALYSIS_PAYLOAD");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.error === "string") {
    throw new Error(d.message ? String(d.message) : "ANALYSIS_FAILED");
  }

  const recommendation =
    d.recommendation && typeof d.recommendation === "object"
      ? (d.recommendation as FullAnalysis["recommendation"])
      : {
          outcome: "",
          confidence: "HIDDEN" as const,
          reasoning: null,
          scenarios: undefined,
        };

  const expiresAt =
    typeof d.expiresAt === "string"
      ? d.expiresAt
      : new Date(Date.now() + 15 * 60_000).toISOString();

  return {
    matchId: typeof d.matchId === "string" ? d.matchId : "",
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
    expiresAt,
    isLive: Boolean(d.isLive),
    isPro: d.isPro === true,
    probabilities:
      d.probabilities && typeof d.probabilities === "object"
        ? (d.probabilities as FullAnalysis["probabilities"])
        : { home: 34, draw: 33, away: 33 },
    recommendation,
    summary: typeof d.summary === "string" ? d.summary : "",
    detailedAnalysis:
      typeof d.detailedAnalysis === "string" ? d.detailedAnalysis : "",
    keyFactors: Array.isArray(d.keyFactors)
      ? (d.keyFactors as FullAnalysis["keyFactors"])
      : [],
    newsImpact: Array.isArray(d.newsImpact)
      ? (d.newsImpact as FullAnalysis["newsImpact"])
      : [],
    stats: Array.isArray(d.stats) ? (d.stats as FullAnalysis["stats"]) : [],
    homeForm: Array.isArray(d.homeForm)
      ? (d.homeForm as FullAnalysis["homeForm"])
      : [],
    awayForm: Array.isArray(d.awayForm)
      ? (d.awayForm as FullAnalysis["awayForm"])
      : [],
  };
}
