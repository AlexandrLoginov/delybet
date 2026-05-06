"use client";

import { StatisticsView } from "@/components/statistics/statistics-view";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function StatisticsWithDevPro({ urlIsPro }: { urlIsPro: boolean }) {
  const { data: authMe } = useAuthMe();
  const devPro = useDevProPreview();
  const devToolsBypass =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
  const isPro =
    Boolean(authMe?.isPro) ||
    devPro ||
    (devToolsBypass && urlIsPro);
  return <StatisticsView isPro={isPro} />;
}
