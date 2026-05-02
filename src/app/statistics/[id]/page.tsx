import { notFound } from "next/navigation";

import { HistoryDetailView } from "@/components/history/HistoryDetailView";
import { getMockHistoryById } from "@/lib/mock-data";

interface StatisticsDetailPageProps {
  params: { id: string };
}

export default function StatisticsDetailPage({
  params,
}: StatisticsDetailPageProps) {
  const match = getMockHistoryById(params.id);
  if (!match) notFound();

  return <HistoryDetailView match={match} />;
}
