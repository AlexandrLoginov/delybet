"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowClockwise, Trophy } from "@phosphor-icons/react";
import useSWR from "swr";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { MatchCard } from "@/components/matches/MatchCard";
import { SportFilter } from "@/components/matches/SportFilter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { useFreePreviewRedeemedIds } from "@/hooks/use-free-preview-redeemed-id";
import {
  computeEligibleMatchIds,
  getFreeLivePreviewEligibleId,
} from "@/lib/freemium";
import { SPORTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Match, SportSlug } from "@/types/match";

const PAGE_SIZE = 5;
const COUNTDOWN_SECONDS = 120;
const SYNCING_MS = 1800;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(typeof json?.message === "string" ? json.message : "FETCH_FAILED");
  }
  return json as { matches: Match[] };
};

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MatchesView() {
  const [sport, setSport] = useState<SportSlug | "all">("all");
  const [tab, setTab] = useState<"upcoming" | "live">("upcoming");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [analysisSyncing, setAnalysisSyncing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const secondsRef = useRef(COUNTDOWN_SECONDS);
  const devPro = useDevProPreview();
  const freePreviewSlots = useFreePreviewRedeemedIds();
  const redeemedFreeMatchId =
    tab === "live" ? freePreviewSlots.live : freePreviewSlots.upcoming;

  const listUrl = `/api/matches?tab=${tab}&sport=all`;
  const {
    data,
    error,
    isLoading,
    mutate: mutateMatches,
  } = useSWR(listUrl, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 120_000,
  });

  const { data: livePayload, mutate: mutateLive } = useSWR(
    "/api/matches?tab=live&sport=all",
    fetcher,
    { refreshInterval: 60_000 }
  );

  const tabMatches = data?.matches ?? [];

  const allEventsCount = tabMatches.length;

  const countsBySport = useMemo(() => {
    return Object.fromEntries(
      SPORTS.map(({ slug }) => [
        slug,
        tabMatches.filter((m) => m.sport === slug).length,
      ])
    ) as Record<SportSlug, number>;
  }, [tabMatches]);

  const matches = useMemo(() => {
    const filtered = tabMatches.filter((m) => {
      if (sport !== "all" && m.sport !== sport) return false;
      return true;
    });

    if (tab === "live") {
      const freeLiveId = getFreeLivePreviewEligibleId();
      if (!freeLiveId) return filtered;
      const idx = filtered.findIndex((m) => m.id === freeLiveId);
      if (idx <= 0) return filtered;
      const first = filtered[idx];
      return [first, ...filtered.filter((_, i) => i !== idx)];
    }

    if (
      sport !== "all" ||
      !redeemedFreeMatchId ||
      filtered[0]?.id === redeemedFreeMatchId
    ) {
      return filtered;
    }

    const idx = filtered.findIndex((m) => m.id === redeemedFreeMatchId);
    if (idx <= 0) return filtered;

    const redeemedMatch = filtered[idx];
    const rest = filtered.filter((_, i) => i !== idx);
    return redeemedMatch ? [redeemedMatch, ...rest] : filtered;
  }, [tabMatches, sport, tab, redeemedFreeMatchId]);

  const eligibleIds = useMemo(() => {
    if (tab === "live") {
      const id = getFreeLivePreviewEligibleId();
      return id ? new Set<string>([id]) : new Set<string>();
    }
    return computeEligibleMatchIds(matches);
  }, [tab, matches]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sport, tab]);

  const refreshLists = () => {
    void mutateMatches();
    void mutateLive();
  };

  useEffect(() => {
    const syncingRef = { current: false };
    let timeoutId: ReturnType<typeof setTimeout>;
    const tickId = setInterval(() => {
      if (syncingRef.current) return;
      const s = secondsRef.current;
      if (s <= 1) {
        syncingRef.current = true;
        setAnalysisSyncing(true);
        secondsRef.current = 0;
        setSecondsLeft(0);
        timeoutId = setTimeout(() => {
          syncingRef.current = false;
          setAnalysisSyncing(false);
          secondsRef.current = COUNTDOWN_SECONDS;
          setSecondsLeft(COUNTDOWN_SECONDS);
          refreshLists();
        }, SYNCING_MS);
        return;
      }
      const next = s - 1;
      secondsRef.current = next;
      setSecondsLeft(next);
    }, 1000);
    return () => {
      clearInterval(tickId);
      clearTimeout(timeoutId);
    };
  }, [tab]);

  const visibleMatches = matches.slice(0, visibleCount);
  const remaining = Math.max(matches.length - visibleCount, 0);
  const liveCount = livePayload?.matches?.length ?? 0;

  if (isLoading && !data) {
    return <AppPageSkeleton variant="list" />;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
              Матчи дня
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ИИ-анализ · обновление каждые 2 минуты
            </p>
            <div
              className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <ArrowClockwise
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  analysisSyncing && "animate-spin",
                  analysisSyncing ? "text-primary" : "text-success"
                )}
                weight="fill"
              />
              <span>
                {analysisSyncing ? (
                  "Обновляем ИИ-анализ…"
                ) : (
                  <>
                    Обновление через:{" "}
                    <span className="tabular-nums text-foreground">
                      {formatCountdown(secondsLeft)}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-destructive/35 bg-destructive/5 px-4 py-3 text-sm">
            <span className="text-destructive">
              Не удалось загрузить матчи. Проверьте API_SPORTS_KEY или попробуйте
              позже.
            </span>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => refreshLists()}>
              Обновить
            </Button>
          </div>
        ) : null}

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "upcoming" | "live")}
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="live">
              Live
              {liveCount > 0 && (
                <span className="inline-flex min-h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive/15 px-1 text-[10px] font-semibold tabular-nums leading-tight text-destructive">
                  {liveCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <SportFilter
              value={sport}
              onChange={setSport}
              allEventsCount={allEventsCount}
              countsBySport={countsBySport}
            />
          </div>

          <TabsContent value={tab} className="mt-4">
            <MatchList
              matches={visibleMatches}
              eligibleIds={eligibleIds}
              redeemedFreeMatchId={redeemedFreeMatchId}
              unlockAllPro={devPro}
            />

            {remaining > 0 && (
              <div className="mt-5 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setVisibleCount((v) => Math.min(v + PAGE_SIZE, matches.length))
                  }
                  className="gap-1.5"
                >
                  Показать ещё
                  <span className="ml-0.5 tabular-nums text-muted-foreground">
                    {Math.min(remaining, PAGE_SIZE)}
                  </span>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function MatchList({
  matches,
  eligibleIds,
  redeemedFreeMatchId,
  unlockAllPro,
}: {
  matches: Match[];
  eligibleIds: Set<string>;
  redeemedFreeMatchId: string | null;
  unlockAllPro: boolean;
}) {
  if (!matches.length) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Trophy className="h-4 w-4" weight="fill" />
        </div>
        <div className="text-sm font-medium">Сейчас матчей нет</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Попробуй сменить вкладку или фильтр.
        </p>
      </div>
    );
  }

  const groups = groupByLeague(matches);

  return (
    <div className="space-y-5">
      {groups.map(({ league, items }) => (
        <section key={league} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {league}
            </h2>
            <span className="tabular-nums text-xs text-muted-foreground">
              {items.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((m) => {
              const isEligibleSpot = eligibleIds.has(m.id);
              const unlocked = unlockAllPro
                ? true
                : redeemedFreeMatchId === null
                  ? isEligibleSpot
                  : redeemedFreeMatchId === m.id;
              const consumeFreePreviewOnClick =
                !unlockAllPro &&
                redeemedFreeMatchId === null &&
                isEligibleSpot;

              return (
                <MatchCard
                  key={m.id}
                  match={m}
                  unlocked={unlocked}
                  consumeFreePreviewOnClick={consumeFreePreviewOnClick}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByLeague(matches: Match[]) {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const key = `${m.league} · ${m.country}`;
    const arr = map.get(key) ?? [];
    arr.push(m);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([league, items]) => ({ league, items }));
}
