"use client";

import useSWR from "swr";

import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { MatchFreePreviewGate } from "@/components/paywall/MatchFreePreviewGate";
import { Button } from "@/components/ui/button";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useAdminDataSource } from "@/hooks/use-admin-data-source";
import {
  useIsProfileAdmin,
  useTelegramInitData,
} from "@/hooks/use-is-profile-admin";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { adminFetchInit, withAdminDataSourceParam } from "@/lib/admin-fetch";
import { normalizeAnalysisPayload } from "@/lib/analysis-api-normalize";
import { fillAnalysisDemoGaps } from "@/lib/analysis-demo-fill";
import { getFreeLivePreviewEligibleIdFromMatches } from "@/lib/freemium";
import type { Match } from "@/types/match";

const fetcher = async ([url, initData]: readonly [string, string | null]) => {
  const res = await fetch(url, adminFetchInit(initData));
  const data = await res.json();
  if (!res.ok) {
    const code = typeof data?.error === "string" ? data.error : "";
    const msg =
      typeof data?.message === "string" ? data.message : "ANALYSIS_FAILED";
    const err = new Error(msg) as Error & { code?: string; status?: number };
    err.code = code;
    err.status = res.status;
    throw err;
  }
  return data;
};

const matchesFetcher = async ([url, initData]: readonly [string, string | null]) => {
  const res = await fetch(url, adminFetchInit(initData));
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data?.message === "string" ? data.message : "MATCHES_FAILED"
    );
  }
  return data as { matches: Match[] };
};

export function MatchAnalysisWithDevPro({
  match,
  urlIsPro,
}: {
  match: Match;
  urlIsPro: boolean;
}) {
  const { t } = useAppLocale();
  const { data: authMe } = useAuthMe();
  const adminDataSource = useAdminDataSource();
  const isAdmin = useIsProfileAdmin();
  const initData = useTelegramInitData();
  const devPro = useDevProPreview();
  const devTools =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
  const dbPro = authMe?.isPro === true;
  const isPro = dbPro || devPro || (devTools && urlIsPro);
  const proParam = isPro ? "true" : "false";

  const swrKey = withAdminDataSourceParam(
    `/api/analysis/${match.id}?sport=${encodeURIComponent(match.sport)}&status=${encodeURIComponent(match.status)}&pro=${proParam}`,
    adminDataSource,
    isAdmin
  );

  const { data, error, isLoading, mutate } = useSWR(
    [swrKey, initData] as const,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  const needLiveFreemiumList = match.status === "live" && !isPro;
  const { data: liveListPayload, isLoading: liveListLoading, error: liveListError } =
    useSWR(
      needLiveFreemiumList
        ? ([
            withAdminDataSourceParam(
              "/api/matches?tab=live&sport=all",
              adminDataSource,
              isAdmin
            ),
            initData,
          ] as const)
        : null,
      matchesFetcher,
      { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

  const waitLiveList =
    needLiveFreemiumList && liveListLoading && !liveListError;

  if (error) {
    const err = error as Error & { code?: string; status?: number };
    const rateLimited =
      err.code === "RATE_LIMIT" ||
      err.status === 429 ||
      /429|too many requests|rate limit/i.test(err.message);
    const billingIssue = err.code === "BILLING";
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {billingIssue
            ? t("analysis.billingError")
            : rateLimited
              ? t("analysis.rateLimitError")
              : t("analysis.loadError")}
        </p>
        {!rateLimited && !billingIssue && isAdmin ? (
          <p className="mt-2 text-xs text-destructive">{String(error.message)}</p>
        ) : null}
        <Button type="button" className="mt-4" size="sm" onClick={() => mutate()}>
          {t("analysis.retry")}
        </Button>
      </main>
    );
  }

  if (isLoading || !data || waitLiveList) {
    return <AppPageSkeleton variant="detail" />;
  }

  let analysis;
  try {
    const normalized = normalizeAnalysisPayload(data);
    analysis =
      data?.dataSource === "api"
        ? normalized
        : fillAnalysisDemoGaps(match, normalized);
  } catch {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8 text-center text-sm text-muted-foreground">
        {t("analysis.invalidResponse")}
      </main>
    );
  }

  const liveFreeEligibleId = needLiveFreemiumList
    ? getFreeLivePreviewEligibleIdFromMatches(liveListPayload?.matches ?? [])
    : undefined;

  return (
    <MatchFreePreviewGate
      match={match}
      isPro={isPro}
      liveFreeEligibleId={liveFreeEligibleId}
    >
      <MatchAnalysisView match={match} analysis={analysis} isPro={isPro} />
    </MatchFreePreviewGate>
  );
}
