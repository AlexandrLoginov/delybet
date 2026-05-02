"use client";

import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { MatchFreePreviewGate } from "@/components/paywall/MatchFreePreviewGate";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import type { FullAnalysis } from "@/types/analysis";
import type { Match } from "@/types/match";

export function MatchAnalysisWithDevPro({
  match,
  analysis,
  urlIsPro,
}: {
  match: Match;
  analysis: FullAnalysis;
  urlIsPro: boolean;
}) {
  const devPro = useDevProPreview();
  const isPro = urlIsPro || devPro;

  return (
    <MatchFreePreviewGate match={match} isPro={isPro}>
      <MatchAnalysisView match={match} analysis={analysis} isPro={isPro} />
    </MatchFreePreviewGate>
  );
}
