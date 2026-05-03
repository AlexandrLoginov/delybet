import { notFound } from "next/navigation";

import { MatchAnalysisWithDevPro } from "@/components/analysis/match-analysis-with-dev-pro";
import { resolveMatch } from "@/lib/resolve-match";

interface MatchPageProps {
  params: { id: string };
  searchParams: { pro?: string };
}

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const match = await resolveMatch(params.id);
  if (!match) notFound();

  const urlIsPro = searchParams.pro === "true";

  return <MatchAnalysisWithDevPro match={match} urlIsPro={urlIsPro} />;
}
