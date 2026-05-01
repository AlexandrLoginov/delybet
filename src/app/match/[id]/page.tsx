import { notFound } from "next/navigation";

import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { MatchFreePreviewGate } from "@/components/paywall/MatchFreePreviewGate";
import { getMockAnalysis, getMockMatchById } from "@/lib/mock-data";

interface MatchPageProps {
  params: { id: string };
  searchParams: { pro?: string };
}

export default function MatchPage({ params, searchParams }: MatchPageProps) {
  const match = getMockMatchById(params.id);
  if (!match) notFound();

  const analysis = getMockAnalysis(params.id);
  const isPro = searchParams.pro === "true";

  return (
    <MatchFreePreviewGate match={match} isPro={isPro}>
      <MatchAnalysisView match={match} analysis={analysis} isPro={isPro} />
    </MatchFreePreviewGate>
  );
}
