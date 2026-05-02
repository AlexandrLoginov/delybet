"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Archive,
  ChartBar,
  Globe,
  LockSimple,
  Sparkle,
  Target,
  Trophy,
  TrendUp,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryCard } from "@/components/history/HistoryCard";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";
import { HISTORY_UI_DEMO_AGGREGATES } from "@/lib/history-demo-aggregates";
import { inferPredictedOutcome } from "@/lib/history-prediction";
import { MOCK_HISTORY, SPORTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { HistoryMatch, SportSlug } from "@/types/match";

type HistoryPeriod = "today" | "week" | "month" | "threeMonths";

const PERIODS: HistoryPeriod[] = [
  "today",
  "week",
  "month",
  "threeMonths",
];

const PERIODS_VISIBLE_FOR_FREE = PERIODS.filter((p) => p !== "threeMonths");

const HISTORY_PERIOD_TITLE: Record<HistoryPeriod, string> = {
  today: "Сегодня",
  week: "Неделя",
  month: "Месяц",
  threeMonths: "3 месяца",
};

export function StatisticsView({ isPro = false }: { isPro?: boolean }) {
  const [period, setPeriod] = useState<HistoryPeriod>(() =>
    isPro ? "threeMonths" : "month"
  );

  useEffect(() => {
    if (!isPro && period === "threeMonths") setPeriod("month");
  }, [isPro, period]);

  const demoAgg: { total: number; correct: number } =
    HISTORY_UI_DEMO_AGGREGATES[period];
  const accuracy =
    demoAgg.total === 0
      ? 0
      : Math.round((demoAgg.correct / demoAgg.total) * 100);

  const overviewMonth = HISTORY_UI_DEMO_AGGREGATES.month;
  const overviewAccuracyMonth = Math.round(
    (overviewMonth.correct / Math.max(1, overviewMonth.total)) * 100
  );

  const leaguesTracked = useMemo(
    () => new Set(MOCK_HISTORY.map((m) => m.league)).size,
    []
  );

  const sportBreakdown = useMemo(() => {
    const order: SportSlug[] = ["football", "basketball", "tennis", "volleyball"];
    return order.map((sport) => {
      const subset = MOCK_HISTORY.filter((m) => m.sport === sport);
      let correct = 0;
      for (const m of subset) {
        if (inferPredictedOutcome(m) === m.actualOutcome) correct++;
      }
      const total = subset.length;
      const pct = total ? Math.round((correct / total) * 100) : 0;
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
  }, []);

  const outcomeShares = useMemo(() => {
    let home = 0;
    let draw = 0;
    let away = 0;
    for (const m of MOCK_HISTORY) {
      if (m.actualOutcome === "HOME") home++;
      else if (m.actualOutcome === "DRAW") draw++;
      else away++;
    }
    const n = MOCK_HISTORY.length || 1;
    return {
      home,
      draw,
      away,
      hp: Math.round((home / n) * 100),
      dp: Math.round((draw / n) * 100),
      ap: Math.round((away / n) * 100),
    };
  }, []);

  const overallAccuracy = useMemo(() => {
    let correct = 0;
    for (const m of MOCK_HISTORY) {
      if (inferPredictedOutcome(m) === m.actualOutcome) correct++;
    }
    const n = MOCK_HISTORY.length;
    return n ? Math.round((correct / n) * 100) : 0;
  }, []);

  const bestSport = useMemo(() => {
    let best = sportBreakdown[0];
    for (const row of sportBreakdown) {
      if (row.total === 0) continue;
      if (!best || row.pct > best.pct) best = row;
    }
    return best;
  }, [sportBreakdown]);

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Статистика
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Показатели модели по завершённым матчам, разрезы по спорту и журнал
            результатов
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            icon={TrendUp}
            label="Точность (30 дн.)"
            value={`${overviewAccuracyMonth}%`}
            sub={`${overviewMonth.correct} из ${overviewMonth.total}`}
            tone="primary"
          />
          <StatTile
            icon={ChartBar}
            label="Точность в базе"
            value={`${overallAccuracy}%`}
            sub={`${MOCK_HISTORY.length} матчей`}
            tone="success"
          />
          <StatTile
            icon={Globe}
            label="Лиг в мониторинге"
            value={String(leaguesTracked)}
            sub="уникальных турниров"
            tone="muted"
          />
          <StatTile
            icon={Sparkle}
            label="Лидер по точности"
            value={
              bestSport && bestSport.total > 0
                ? `${bestSport.emoji} ${bestSport.label}`
                : "—"
            }
            sub={
              bestSport && bestSport.total > 0
                ? `${bestSport.pct}% · ${bestSport.correct}/${bestSport.total}`
                : "нет данных"
            }
            tone="muted"
          />
        </div>

        <Card className="mt-5 overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                <Target className="h-3.5 w-3.5" weight="fill" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Точность по видам спорта
              </div>
            </div>
            <div className="space-y-3">
              {sportBreakdown.map((row) => (
                <div key={row.sport} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-foreground">
                      <span aria-hidden>{row.emoji}</span> {row.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {row.pct}% · {row.correct}/{row.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success transition-[width]"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Фактические исходы в базе
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <span
                className="h-full bg-success"
                style={{ width: `${outcomeShares.hp}%` }}
                title={`Дома ${outcomeShares.home}`}
              />
              <span
                className="h-full bg-muted-foreground/35"
                style={{ width: `${outcomeShares.dp}%` }}
                title={`Ничьи ${outcomeShares.draw}`}
              />
              <span
                className="h-full bg-primary"
                style={{ width: `${outcomeShares.ap}%` }}
                title={`Гости ${outcomeShares.away}`}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>
                Дома{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {outcomeShares.hp}%
                </span>
              </span>
              <span>
                Ничья{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {outcomeShares.dp}%
                </span>
              </span>
              <span>
                Гости{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {outcomeShares.ap}%
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="mb-4 px-1 text-base font-semibold tracking-tight">
            Журнал матчей
          </h2>
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as HistoryPeriod)}
          >
            <TabsList className="grid h-auto w-full grid-cols-4 gap-1">
              <TabsTrigger value="today">Сегодня</TabsTrigger>
              <TabsTrigger value="week">Неделя</TabsTrigger>
              <TabsTrigger value="month">Месяц</TabsTrigger>
              {isPro ? (
                <TabsTrigger value="threeMonths">3 месяца</TabsTrigger>
              ) : (
                <UpgradeModal
                  trigger={
                    <button
                      type="button"
                      aria-label="3 месяца — только в DelyBet Pro"
                      className={cn(
                        "flex w-full min-h-0 flex-row flex-nowrap items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium leading-tight text-muted-foreground outline-none ring-offset-background whitespace-nowrap transition-colors hover:bg-background/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-xs sm:leading-tight"
                      )}
                    >
                      <LockSimple
                        className="h-2.5 w-2.5 shrink-0 opacity-70"
                        weight="fill"
                        aria-hidden
                      />
                      <span>3 месяца</span>
                    </button>
                  }
                />
              )}
            </TabsList>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatTile
                icon={Target}
                label="Точность"
                value={`${accuracy}%`}
                sub={`${demoAgg.correct} из ${demoAgg.total}`}
                tone="primary"
              />
              <StatTile
                icon={Trophy}
                label="Угаданных"
                value={String(demoAgg.correct)}
                sub={`за ${demoAgg.total} матчей`}
                tone="success"
              />
            </div>

            {(isPro ? PERIODS : PERIODS_VISIBLE_FOR_FREE).map((p) => (
              <TabsContent key={p} value={p} className="mt-8">
                <HistoryGroupedList period={p} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="mt-8">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Archive className="h-4 w-4" weight="fill" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                Анализ хранится 90 дней
              </div>
              <p className="text-xs text-muted-foreground">
                Записи используются для отчётности точности и калибровки по лигам.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function HistoryGroupedList({ period }: { period: HistoryPeriod }) {
  const matches = useMemo(
    () => filterHistoryByPeriod(MOCK_HISTORY, period, new Date()),
    [period]
  );
  const groups = useMemo(() => groupByDate(matches), [matches]);

  const showDateSubgroups = period === "today";

  const sortedFlat = useMemo(
    () =>
      [...matches].sort(
        (a, b) =>
          new Date(b.finishedISO).getTime() -
          new Date(a.finishedISO).getTime()
      ),
    [matches]
  );

  const sectionTitle = HISTORY_PERIOD_TITLE[period];

  if (!matches.length) {
    return (
      <div className="rounded-xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        За выбранный период матчей нет
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sectionTitle}
        </h3>
        <span className="tabular-nums text-xs text-muted-foreground">
          {HISTORY_UI_DEMO_AGGREGATES[period].total}
        </span>
      </div>

      {showDateSubgroups ? (
        <div className="flex flex-col gap-5">
          {groups.map(({ key, label, items }) => {
            const hideSubgroupHeader =
              groups.length === 1 && label === sectionTitle;
            return (
              <section key={key} className="space-y-2">
                {!hideSubgroupHeader && (
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </h4>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {items.map((m) => (
                    <HistoryCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedFlat.map((m) => (
            <HistoryCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function filterHistoryByPeriod(
  matches: HistoryMatch[],
  period: HistoryPeriod,
  now: Date
): HistoryMatch[] {
  const todayStart = startOfDayLocal(now);
  const end = todayStart.getTime();

  return matches.filter((m) => {
    const dayStart = startOfDayLocal(new Date(m.finishedISO));
    const t = dayStart.getTime();

    switch (period) {
      case "today":
        return t === end;

      case "week": {
        const start = end - 6 * MS_PER_DAY;
        return t >= start && t <= end;
      }

      case "month": {
        const start = end - 29 * MS_PER_DAY;
        return t >= start && t <= end;
      }

      case "threeMonths": {
        const start = end - 89 * MS_PER_DAY;
        return t >= start && t <= end;
      }
    }
  });
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: PhosphorIcon;
  label: string;
  value: string;
  sub: string;
  tone: "primary" | "success" | "muted";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "success"
        ? "bg-success-muted text-success ring-1 ring-inset ring-success/30"
        : "bg-muted text-muted-foreground ring-1 ring-inset ring-border";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${toneCls}`}
        >
          <Icon className="h-4 w-4" weight="fill" />
        </div>
        <div className="space-y-1.5">
          <div className="tabular-nums text-xl font-semibold leading-tight">
            {value}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function groupByDate(items: HistoryMatch[]) {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.finishedISO).getTime() - new Date(a.finishedISO).getTime()
  );

  const today = startOfDayLocal(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups = new Map<string, { label: string; items: HistoryMatch[] }>();

  for (const m of sorted) {
    const d = startOfDayLocal(new Date(m.finishedISO));
    let key: string;
    let label: string;

    if (d.getTime() === today.getTime()) {
      key = "today";
      label = "Сегодня";
    } else if (d.getTime() === yesterday.getTime()) {
      key = "yesterday";
      label = "Вчера";
    } else {
      key = d.toISOString();
      label = d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
    }

    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(m);
  }

  return Array.from(groups.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
}
