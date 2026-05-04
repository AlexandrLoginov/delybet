import { inferPredictedOutcome } from "@/lib/history-prediction";
import { SPORTS } from "@/lib/mock-data";
import type { HistoryMatch, SportSlug } from "@/types/match";

export type StatsWindowTab = "d1" | "d7" | "d30" | "d90";

export const STATS_TAB_ORDER: StatsWindowTab[] = ["d1", "d7", "d30", "d90"];

export const STATS_TAB_LABEL: Record<StatsWindowTab, string> = {
  d1: "1 день",
  d7: "7 дней",
  d30: "30 дней",
  d90: "90 дней",
};

export function statsWindowMs(tab: StatsWindowTab): number {
  const day = 24 * 60 * 60 * 1000;
  switch (tab) {
    case "d1":
      return day;
    case "d7":
      return 7 * day;
    case "d30":
      return 30 * day;
    case "d90":
      return 90 * day;
  }
}

export function filterHistoryByWindow(
  matches: HistoryMatch[],
  tab: StatsWindowTab,
  now: Date
): HistoryMatch[] {
  const cutoff = now.getTime() - statsWindowMs(tab);
  return matches.filter((m) => new Date(m.finishedISO).getTime() >= cutoff);
}

export function computeWindowAccuracy(matches: HistoryMatch[]): {
  correct: number;
  total: number;
  pct: number;
} {
  let correct = 0;
  for (const m of matches) {
    if (inferPredictedOutcome(m) === m.actualOutcome) correct++;
  }
  const total = matches.length;
  return {
    correct,
    total,
    pct: total ? Math.round((correct / total) * 100) : 0,
  };
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Точность по календарным дням (для графика тренда), дни по возрастанию. */
export function dailyAccuracyBuckets(matches: HistoryMatch[]): Array<{
  sortKey: number;
  label: string;
  pct: number;
  total: number;
}> {
  const map = new Map<number, HistoryMatch[]>();
  for (const m of matches) {
    const d = startOfDayLocal(new Date(m.finishedISO));
    const t = d.getTime();
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(m);
  }
  return [...map.entries()]
    .map(([sortKey, items]) => {
      const { pct, total } = computeWindowAccuracy(items);
      const label = new Date(sortKey).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      return { sortKey, label, pct, total };
    })
    .sort((a, b) => a.sortKey - b.sortKey);
}

export function sportBreakdownForMatches(matches: HistoryMatch[]): Array<{
  sport: SportSlug;
  label: string;
  emoji: string;
  total: number;
  correct: number;
  pct: number;
}> {
  const order: SportSlug[] = ["football", "basketball", "tennis", "volleyball"];
  return order.map((sport) => {
    const subset = matches.filter((m) => m.sport === sport);
    const { correct, total, pct } = computeWindowAccuracy(subset);
    const meta = SPORTS.find((s) => s.slug === sport);
    return {
      sport,
      label: meta?.label ?? sport,
      emoji: meta?.emoji ?? "",
      total,
      correct,
      pct,
    };
  });
}
