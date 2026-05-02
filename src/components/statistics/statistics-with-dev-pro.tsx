"use client";

import { StatisticsView } from "@/components/statistics/statistics-view";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function StatisticsWithDevPro({ urlIsPro }: { urlIsPro: boolean }) {
  const devPro = useDevProPreview();
  return <StatisticsView isPro={urlIsPro || devPro} />;
}
