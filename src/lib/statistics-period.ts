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

const MS_DAY = 86400000;
const MS_HOUR = 3600000;

/** Заголовок и подпись блока графика в зависимости от вкладки. */
export function statisticsChartCopy(tab: StatsWindowTab): {
  heading: string;
  hint: string;
} {
  switch (tab) {
    case "d1":
      return {
        heading: "Динамика за сутки",
        hint: "Ось: слоты по 6 часов (от −24 ч до текущего момента).",
      };
    case "d7":
      return {
        heading: "Динамика по дням",
        hint: "Ось: календарные дни в выбранной неделе.",
      };
    case "d30":
      return {
        heading: "Динамика по интервалам",
        hint: "Ось: конец каждого 5-дневного отрезка в окне 30 дней.",
      };
    case "d90":
      return {
        heading: "Динамика по интервалам",
        hint: "Ось: конец каждого 9-дневного отрезка в окне 90 дней.",
      };
  }
}

/**
 * Ряд для графика: подписи и шаг зависят от вкладки (сутки — часы, 30/90 — интервалы).
 */
export function buildStatisticsChartSeries(
  windowMatches: HistoryMatch[],
  tab: StatsWindowTab,
  now: Date
): Array<{ sortKey: number; label: string; pct: number; total: number }> {
  const tNow = now.getTime();

  const subsetInRange = (fromMs: number, toMsExclusive: number) =>
    windowMatches.filter((m) => {
      const t = new Date(m.finishedISO).getTime();
      return t >= fromMs && t < toMsExclusive;
    });

  if (tab === "d1") {
    const n = 4;
    const slice = MS_DAY / n;
    const windowStart = tNow - MS_DAY;
    const out: Array<{
      sortKey: number;
      label: string;
      pct: number;
      total: number;
    }> = [];
    for (let k = 0; k < n; k++) {
      const a = windowStart + k * slice;
      const b = windowStart + (k + 1) * slice;
      const subset = subsetInRange(a, b);
      const { pct, total } = computeWindowAccuracy(subset);
      const label = k === n - 1 ? "сейчас" : `−${(n - 1 - k) * 6}ч`;
      out.push({ sortKey: a, label, pct, total });
    }
    return out;
  }

  if (tab === "d7") {
    const endDay = startOfDayLocal(now);
    const out: Array<{
      sortKey: number;
      label: string;
      pct: number;
      total: number;
    }> = [];
    for (let k = 0; k < 7; k++) {
      const d0 = new Date(endDay);
      d0.setDate(endDay.getDate() - 6 + k);
      const d1 = new Date(d0);
      d1.setDate(d0.getDate() + 1);
      const a = d0.getTime();
      const b = d1.getTime();
      const subset = subsetInRange(a, b);
      const { pct, total } = computeWindowAccuracy(subset);
      const label = d0.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      out.push({ sortKey: a, label, pct, total });
    }
    return out;
  }

  if (tab === "d30") {
    const bucketDays = 5;
    const windowStart = tNow - 30 * MS_DAY;
    const num = Math.ceil(30 / bucketDays);
    const out: Array<{
      sortKey: number;
      label: string;
      pct: number;
      total: number;
    }> = [];
    for (let k = 0; k < num; k++) {
      const a = windowStart + k * bucketDays * MS_DAY;
      const bExcl =
        k === num - 1 ? tNow + 1 : a + bucketDays * MS_DAY;
      const subset = subsetInRange(a, bExcl);
      const { pct, total } = computeWindowAccuracy(subset);
      const labelAt = new Date(Math.min(bExcl - MS_HOUR, tNow));
      const label = labelAt.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      out.push({ sortKey: a, label, pct, total });
    }
    return out;
  }

  /* d90 */
  const bucketDays = 9;
  const windowStart = tNow - 90 * MS_DAY;
  const num = Math.ceil(90 / bucketDays);
  const out: Array<{
    sortKey: number;
    label: string;
    pct: number;
    total: number;
  }> = [];
  for (let k = 0; k < num; k++) {
    const a = windowStart + k * bucketDays * MS_DAY;
    const bExcl = k === num - 1 ? tNow + 1 : a + bucketDays * MS_DAY;
    const subset = subsetInRange(a, bExcl);
    const { pct, total } = computeWindowAccuracy(subset);
    const labelAt = new Date(Math.min(bExcl - MS_HOUR, tNow));
    const label = labelAt.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
    out.push({ sortKey: a, label, pct, total });
  }
  return out;
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
