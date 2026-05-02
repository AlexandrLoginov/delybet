import { notFound } from "next/navigation";

import { MatchAnalysisWithDevPro } from "@/components/analysis/match-analysis-with-dev-pro";
import { getMockAnalysis, getMockMatchById } from "@/lib/mock-data";

interface MatchPageProps {
  params: { id: string };
  searchParams: { pro?: string };
}

export default function MatchPage({ params, searchParams }: MatchPageProps) {
  const match = getMockMatchById(params.id);
  if (!match) notFound();

  const analysis = getMockAnalysis(params.id);
  const urlIsPro = searchParams.pro === "true";

  return (
    <MatchAnalysisWithDevPro
      match={match}
      analysis={analysis}
      urlIsPro={urlIsPro}
    />
  );
}
