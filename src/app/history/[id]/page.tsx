import { notFound } from "next/navigation";

import { HistoryDetailView } from "@/components/history/HistoryDetailView";
import { getMockHistoryById } from "@/lib/mock-data";

interface HistoryDetailPageProps {
  params: { id: string };
}

export default function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const match = getMockHistoryById(params.id);
  if (!match) notFound();

  return <HistoryDetailView match={match} />;
}
