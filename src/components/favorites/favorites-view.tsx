"use client";

import Link from "next/link";
import { Broom, Star } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MatchCard } from "@/components/matches/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { useFreePreviewRedeemedIds } from "@/hooks/use-free-preview-redeemed-id";
import {
  clearAllFavoriteMatchIds,
  getFavoriteMatchesServerSnapshot,
  getFavoriteMatchesSnapshot,
  subscribeFavoritesChange,
} from "@/lib/favorites";
import {
  computeEligibleMatchIds,
  getFreeLivePreviewEligibleId,
} from "@/lib/freemium";
import { MOCK_MATCHES } from "@/lib/mock-data";
import type { Match } from "@/types/match";

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

function orderFavoriteLive(list: Match[]): Match[] {
  const freeLiveId = getFreeLivePreviewEligibleId();
  if (!freeLiveId) return list;
  const idx = list.findIndex((m) => m.id === freeLiveId);
  if (idx <= 0) return list;
  const first = list[idx];
  return [first, ...list.filter((_, i) => i !== idx)];
}

function orderFavoriteUpcoming(
  list: Match[],
  redeemedFreeMatchId: string | null
): Match[] {
  if (
    !redeemedFreeMatchId ||
    list[0]?.id === redeemedFreeMatchId
  ) {
    return list;
  }

  const idx = list.findIndex((m) => m.id === redeemedFreeMatchId);
  if (idx <= 0) return list;

  const redeemedMatch = list[idx];
  const rest = list.filter((_, i) => i !== idx);
  return redeemedMatch ? [redeemedMatch, ...rest] : list;
}

function FavoritesGroupedList({
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
  return (
    <div className="space-y-5">
      {groupByLeague(matches).map(({ league, items }) => (
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

export function FavoritesView() {
  const [tab, setTab] = useState<"upcoming" | "live">("upcoming");
  const [clearOpen, setClearOpen] = useState(false);
  const devPro = useDevProPreview();
  const favoriteKey = useSyncExternalStore(
    subscribeFavoritesChange,
    getFavoriteMatchesSnapshot,
    getFavoriteMatchesServerSnapshot
  );
  const freePreviewSlots = useFreePreviewRedeemedIds();

  const favorites = useMemo(() => {
    const ids = new Set(favoriteKey ? favoriteKey.split("\0").filter(Boolean) : []);
    if (!ids.size) return [];
    return MOCK_MATCHES.filter((m) => ids.has(m.id)).sort(
      (a, b) =>
        new Date(b.kickoffISO).getTime() - new Date(a.kickoffISO).getTime()
    );
  }, [favoriteKey]);

  const favoritesUpcoming = useMemo(
    () => favorites.filter((m) => m.status === "upcoming"),
    [favorites]
  );
  const favoritesLive = useMemo(
    () => favorites.filter((m) => m.status === "live"),
    [favorites]
  );

  const upcomingOrdered = useMemo(
    () =>
      orderFavoriteUpcoming(favoritesUpcoming, freePreviewSlots.upcoming),
    [favoritesUpcoming, freePreviewSlots.upcoming]
  );

  const liveOrdered = useMemo(
    () => orderFavoriteLive(favoritesLive),
    [favoritesLive]
  );

  const eligibleIdsUpcoming = useMemo(
    () => computeEligibleMatchIds(upcomingOrdered),
    [upcomingOrdered]
  );

  const eligibleIdsLive = useMemo(() => {
    const id = getFreeLivePreviewEligibleId();
    return id ? new Set<string>([id]) : new Set<string>();
  }, []);

  useEffect(() => {
    if (
      favorites.length > 0 &&
      favoritesUpcoming.length === 0 &&
      favoritesLive.length > 0
    ) {
      setTab("live");
    }
  }, [
    favorites.length,
    favoritesUpcoming.length,
    favoritesLive.length,
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
      <Drawer open={clearOpen} onOpenChange={setClearOpen}>
        <DrawerContent>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-6">
            <DrawerHeader className="px-0 pt-0 pb-6">
              <DrawerTitle className="pt-2 text-left">Подтвердите действие</DrawerTitle>
              <DrawerDescription className="text-left">
                Вы уверены, что хотите очистить избранные матчи?
              </DrawerDescription>
            </DrawerHeader>
          </div>

          <DrawerFooter className="gap-2">
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="w-full"
              onClick={() => {
                clearAllFavoriteMatchIds();
                setClearOpen(false);
              }}
            >
              Очистить
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setClearOpen(false)}
            >
              Отмена
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Избранное
          </h1>
          {favorites.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 rounded-[8px] text-muted-foreground hover:text-foreground"
              aria-label="Очистить избранное"
              onClick={() => setClearOpen(true)}
            >
              <Broom className="h-[18px] w-[18px]" weight="fill" />
            </Button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Матчи, которые ты сохранил на экране анализа
        </p>
      </div>

      {!favorites.length ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Star className="h-4 w-4" weight="fill" />
          </div>
          <div className="text-sm font-medium">Пока пусто</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Открой анализ матча и нажми «В избранное» вверху экрана.
          </p>
          <Button asChild size="sm" className="mt-5">
            <Link href="/matches">На главную</Link>
          </Button>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "upcoming" | "live")}
          className="mt-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
            <TabsTrigger value="upcoming">
              Предстоящие
              <span className="inline-flex min-h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold tabular-nums leading-tight text-muted-foreground">
                {favoritesUpcoming.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="live">
              Live
              <span
                className={
                  favoritesLive.length > 0
                    ? "inline-flex min-h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive/15 px-1 text-[10px] font-semibold tabular-nums leading-tight text-destructive"
                    : "inline-flex min-h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold tabular-nums leading-tight text-muted-foreground"
                }
              >
                {favoritesLive.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {!upcomingOrdered.length ? (
              <div className="rounded-xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                В избранном нет предстоящих матчей
              </div>
            ) : (
              <FavoritesGroupedList
                matches={upcomingOrdered}
                eligibleIds={eligibleIdsUpcoming}
                redeemedFreeMatchId={freePreviewSlots.upcoming}
                unlockAllPro={devPro}
              />
            )}
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            {!liveOrdered.length ? (
              <div className="rounded-xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                В избранном нет текущих live-матчей
              </div>
            ) : (
              <FavoritesGroupedList
                matches={liveOrdered}
                eligibleIds={eligibleIdsLive}
                redeemedFreeMatchId={freePreviewSlots.live}
                unlockAllPro={devPro}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
