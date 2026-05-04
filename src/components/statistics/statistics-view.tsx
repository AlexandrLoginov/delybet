"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  CheckCircle,
  Globe,
  Info,
  LockSimple,
  Sparkle,
  Target,
  TrendUp,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { StatisticsCharts } from "@/components/statistics/StatisticsCharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";
import { HISTORY_UI_DEMO_AGGREGATES } from "@/lib/history-demo-aggregates";
import {
  STATS_TAB_LABEL,
  STATS_TAB_ORDER,
  type StatsWindowTab,
  computeWindowAccuracy,
  dailyAccuracyBuckets,
  filterHistoryByWindow,
  sportBreakdownForMatches,
} from "@/lib/statistics-period";
import { MOCK_HISTORY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const AGG_FOR_TAB: Record<
  StatsWindowTab,
  keyof typeof HISTORY_UI_DEMO_AGGREGATES
> = {
  d1: "today",
  d7: "week",
  d30: "month",
  d90: "threeMonths",
};

const CHART_SHORT_LABEL: Record<StatsWindowTab, string> = {
  d1: "1 дн.",
  d7: "7 дн.",
  d30: "30 дн.",
  d90: "90 дн.",
};

const tabTriggerClass =
  "inline-flex min-h-0 w-full items-center justify-center gap-1 whitespace-nowrap rounded-md px-1 py-2 text-[10px] font-medium leading-tight ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-xs sm:leading-tight";

export function StatisticsView({ isPro = false }: { isPro?: boolean }) {
  const [tab, setTab] = useState<StatsWindowTab>("d30");

  useEffect(() => {
    if (!isPro && tab === "d90") setTab("d30");
  }, [isPro, tab]);

  const now = useMemo(() => new Date(), []);

  const filteredMatches = useMemo(
    () => filterHistoryByWindow(MOCK_HISTORY, tab, now),
    [tab, now]
  );

  const windowStats = useMemo(
    () => computeWindowAccuracy(filteredMatches),
    [filteredMatches]
  );

  const sportBreakdown = useMemo(
    () => sportBreakdownForMatches(filteredMatches),
    [filteredMatches]
  );

  const leaguesInWindow = useMemo(
    () => new Set(filteredMatches.map((m) => m.league)).size,
    [filteredMatches]
  );

  const bestSport = useMemo(() => {
    let best = sportBreakdown[0];
    for (const row of sportBreakdown) {
      if (row.total === 0) continue;
      if (!best || row.pct > best.pct) best = row;
    }
    return best;
  }, [sportBreakdown]);

  const dailySeries = useMemo(
    () =>
      dailyAccuracyBuckets(filteredMatches).map(({ label, pct, total }) => ({
        label,
        pct,
        total,
      })),
    [filteredMatches]
  );

  const compareItems = useMemo(
    () =>
      STATS_TAB_ORDER.map((t) => {
        const agg = HISTORY_UI_DEMO_AGGREGATES[AGG_FOR_TAB[t]];
        const pct = Math.round((agg.correct / agg.total) * 100);
        return {
          tab: t,
          label: CHART_SHORT_LABEL[t],
          pct,
          locked: t === "d90" && !isPro,
        };
      }),
    [isPro]
  );

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Статистика
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Показатели модели по завершённым матчам и разрезы по видам спорта
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as StatsWindowTab)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1">
            <TabsTrigger value="d1">{STATS_TAB_LABEL.d1}</TabsTrigger>
            <TabsTrigger value="d7">{STATS_TAB_LABEL.d7}</TabsTrigger>
            <TabsTrigger value="d30">{STATS_TAB_LABEL.d30}</TabsTrigger>
            {isPro ? (
              <TabsTrigger value="d90">{STATS_TAB_LABEL.d90}</TabsTrigger>
            ) : (
              <UpgradeModal
                trigger={
                  <button
                    type="button"
                    className={cn(
                      tabTriggerClass,
                      "gap-0.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                    aria-label="90 дней — только в DelyBet Pro"
                  >
                    <LockSimple
                      className="h-2.5 w-2.5 shrink-0 opacity-70"
                      weight="fill"
                      aria-hidden
                    />
                    <span>{STATS_TAB_LABEL.d90}</span>
                  </button>
                }
              />
            )}
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <StatisticsCharts
            activeTab={tab}
            compareItems={compareItems}
            dailySeries={dailySeries}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile
            icon={TrendUp}
            label="Точность"
            value={`${windowStats.pct}%`}
            sub={`${windowStats.correct} из ${windowStats.total} · ${STATS_TAB_LABEL[tab]}`}
            tone="primary"
          />
          <StatTile
            icon={CheckCircle}
            label="Верных прогнозов"
            value={String(windowStats.correct)}
            sub={`в выборке ${windowStats.total} матч.`}
            tone="success"
          />
          <StatTile
            icon={Globe}
            label="Лиг в окне"
            value={windowStats.total ? String(leaguesInWindow) : "—"}
            sub={
              windowStats.total
                ? "уникальных турниров"
                : "нет матчей в периоде"
            }
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
            <p className="text-xs text-muted-foreground">
              В рамках выбранного окна: {STATS_TAB_LABEL[tab].toLowerCase()}.
            </p>
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
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                <Info className="h-3.5 w-3.5" weight="fill" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Как считается точность
              </div>
            </div>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              <li>
                Учитываются только матчи со статусом «завершён» и известным
                исходом 1X2.
              </li>
              <li>
                Сравниваем итоговый прогноз модели с фактическим результатом
                (победа хозяев, ничья, победа гостей).
              </li>
              <li>
                Процент — доля верных прогнозов в выборке; чем больше матчей в
                окне, тем устойчивее оценка.
              </li>
              <li>
                Разрез по спорту и лигам помогает видеть, где модель
                калибруется лучше всего.
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
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
