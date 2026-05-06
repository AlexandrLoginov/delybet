"use client";

import useSWR from "swr";

import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { MatchFreePreviewGate } from "@/components/paywall/MatchFreePreviewGate";
import { Button } from "@/components/ui/button";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { normalizeAnalysisPayload } from "@/lib/analysis-api-normalize";
import type { Match } from "@/types/match";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) {
    const msg =
      typeof data?.message === "string" ? data.message : "ANALYSIS_FAILED";
    throw new Error(msg);
  }
  return data;
};

export function MatchAnalysisWithDevPro({
  match,
  urlIsPro,
}: {
  match: Match;
  urlIsPro: boolean;
}) {
  const { data: authMe } = useAuthMe();
  const devPro = useDevProPreview();
  const devTools =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
  const dbPro = authMe?.isPro === true;
  const isPro = dbPro || devPro || (devTools && urlIsPro);
  const proParam = isPro ? "true" : "false";

  const swrKey = `/api/analysis/${match.id}?sport=${encodeURIComponent(match.sport)}&pro=${proParam}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  if (isLoading || !data) {
    return <AppPageSkeleton variant="detail" />;
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Не удалось загрузить анализ. Проверьте ключи API и попробуйте снова.
        </p>
        <p className="mt-2 text-xs text-destructive">{String(error.message)}</p>
        <Button type="button" className="mt-4" size="sm" onClick={() => mutate()}>
          Повторить
        </Button>
      </main>
    );
  }

  let analysis;
  try {
    analysis = normalizeAnalysisPayload(data);
  } catch {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8 text-center text-sm text-muted-foreground">
        Некорректный ответ анализа.
      </main>
    );
  }

  return (
    <MatchFreePreviewGate match={match} isPro={isPro}>
      <MatchAnalysisView match={match} analysis={analysis} isPro={isPro} />
    </MatchFreePreviewGate>
  );
}
