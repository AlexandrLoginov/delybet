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
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMessages } from "@/i18n";
import { useAppLocale } from "@/hooks/use-app-locale";
import {
  STATS_TAB_ORDER,
  type StatsWindowTab,
  buildStatisticsChartSeries,
  computeWindowAccuracy,
  filterHistoryByWindow,
  sportBreakdownForMatches,
  statisticsChartCopyLocalized,
} from "@/lib/statistics-period";
import { MOCK_HISTORY } from "@/lib/mock-data";
import { sportLabel } from "@/lib/sport-labels";
import { cn } from "@/lib/utils";

const tabTriggerClass =
  "inline-flex min-h-0 w-full items-center justify-center gap-1 whitespace-nowrap rounded-md px-1 py-2 text-[10px] font-medium leading-tight ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-xs sm:leading-tight";

export function StatisticsView({ isPro = false }: { isPro?: boolean }) {
  const { locale, t } = useAppLocale();
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
    () => sportBreakdownForMatches(filteredMatches, (slug) => sportLabel(slug, t)),
    [filteredMatches, t]
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

  const chartSeries = useMemo(
    () => buildStatisticsChartSeries(filteredMatches, tab, now),
    [filteredMatches, tab, now]
  );

  const chartCopy = useMemo(
    () => statisticsChartCopyLocalized(tab, t),
    [tab, t]
  );

  const compareItems = useMemo(
    () =>
      STATS_TAB_ORDER.map((windowTab) => {
        const subset = filterHistoryByWindow(MOCK_HISTORY, windowTab, now);
        const { pct } = computeWindowAccuracy(subset);
        return {
          tab: windowTab,
          label: t(`statistics.tabShort.${windowTab}`),
          pct,
          locked: windowTab === "d90" && !isPro,
        };
      }),
    [isPro, now, t]
  );

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {t("statistics.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("statistics.subtitle")}
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as StatsWindowTab)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1">
            <TabsTrigger value="d1">{t("statistics.tab.d1")}</TabsTrigger>
            <TabsTrigger value="d7">{t("statistics.tab.d7")}</TabsTrigger>
            <TabsTrigger value="d30">{t("statistics.tab.d30")}</TabsTrigger>
            {isPro ? (
              <TabsTrigger value="d90">{t("statistics.tab.d90")}</TabsTrigger>
            ) : (
              <RenewSubscriptionDrawer
                intent="subscribe"
                billingAction="checkout"
                trigger={
                  <button
                    type="button"
                    className={cn(
                      tabTriggerClass,
                      "gap-0.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                    aria-label={t("statistics.lockAria")}
                  >
                    <LockSimple
                      className="h-2.5 w-2.5 shrink-0 opacity-70"
                      weight="fill"
                      aria-hidden
                    />
                    <span>{t("statistics.tab.d90")}</span>
                  </button>
                }
              />
            )}
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <StatisticsCharts
            activeTab={tab}
            chartHeading={chartCopy.heading}
            chartHint={chartCopy.hint}
            compareItems={compareItems}
            dailySeries={chartSeries}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile
            icon={TrendUp}
            label={t("statistics.accuracy")}
            value={`${windowStats.pct}%`}
            sub={t("statistics.matchCount", {
              pct: windowStats.pct,
              total: windowStats.total,
            })}
            tone="primary"
          />
          <StatTile
            icon={CheckCircle}
            label={t("statistics.correctPredictions")}
            value={String(windowStats.correct)}
            sub={t("statistics.correctSub", { total: windowStats.total })}
            tone="success"
          />
          <StatTile
            icon={Globe}
            label={t("statistics.leagues")}
            value={windowStats.total ? String(leaguesInWindow) : t("common.dash")}
            sub={
              windowStats.total
                ? t("statistics.leaguesSub")
                : t("statistics.leaguesEmpty")
            }
            tone="muted"
          />
          <StatTile
            icon={Sparkle}
            label={t("statistics.leader")}
            value={
              bestSport && bestSport.total > 0
                ? `${bestSport.emoji} ${bestSport.label}`
                : t("common.dash")
            }
            sub={
              bestSport && bestSport.total > 0
                ? t("statistics.leaderSub", {
                    pct: bestSport.pct,
                    correct: bestSport.correct,
                    total: bestSport.total,
                  })
                : t("statistics.leaderEmpty")
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
                {t("statistics.bySport")}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("statistics.bySportHint", { period: t(`statistics.tab.${tab}`) })}
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
                {t("statistics.methodology")}
              </div>
            </div>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              {getMessages(locale).statistics.methodologyItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
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
