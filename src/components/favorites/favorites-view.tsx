"use client";

import Link from "next/link";
import { Star, Trophy } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/matches/MatchCard";
import { useFreePreviewRedeemedIds } from "@/hooks/use-free-preview-redeemed-id";
import {
  getFavoriteMatchesServerSnapshot,
  getFavoriteMatchesSnapshot,
  subscribeFavoritesChange,
} from "@/lib/favorites";
import {
  freePreviewKindForMatch,
  isMatchGloballyEligibleForFreePreview,
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

export function FavoritesView() {
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
      <div className="mb-5">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
          Избранное
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Матчи, которые ты сохранил на экране анализа
        </p>
      </div>

      {!favorites.length ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Star className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="text-sm font-medium">Пока пусто</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Открой анализ матча и нажми «В избранное» вверху экрана.
          </p>
          <Button asChild size="sm" className="mt-5 gap-1.5">
            <Link href="/matches">
              <Trophy className="h-3.5 w-3.5" strokeWidth={2} />
              К матчам
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupByLeague(favorites).map(({ league, items }) => (
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
                  const kind = freePreviewKindForMatch(m);
                  const redeemedFreeMatchId =
                    kind === "live"
                      ? freePreviewSlots.live
                      : freePreviewSlots.upcoming;
                  const isEligibleSpot =
                    isMatchGloballyEligibleForFreePreview(m);
                  const unlocked =
                    redeemedFreeMatchId === null
                      ? isEligibleSpot
                      : redeemedFreeMatchId === m.id;
                  const consumeFreePreviewOnClick =
                    redeemedFreeMatchId === null && isEligibleSpot;

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
      )}
    </main>
  );
}
