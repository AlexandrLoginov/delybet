"use client";

import { HistoryView } from "@/components/history/history-view";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function HistoryWithDevPro({ urlIsPro }: { urlIsPro: boolean }) {
  const devPro = useDevProPreview();
  return <HistoryView isPro={urlIsPro || devPro} />;
}
