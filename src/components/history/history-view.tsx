"use client";

import { Archive, Target, Trophy, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryCard } from "@/components/history/HistoryCard";
import { HISTORY_UI_DEMO_AGGREGATES } from "@/lib/history-demo-aggregates";
import { MOCK_HISTORY } from "@/lib/mock-data";
import type { HistoryMatch } from "@/types/match";

type HistoryPeriod = "today" | "week" | "month" | "threeMonths";

const PERIODS: HistoryPeriod[] = [
  "today",
  "week",
  "month",
  "threeMonths",
];

/** Заголовок списка под табами совпадает с выбранным периодом. */
const HISTORY_PERIOD_TITLE: Record<HistoryPeriod, string> = {
  today: "Сегодня",
  week: "Неделя",
  month: "Месяц",
  threeMonths: "3 месяца",
};

export function HistoryView() {
  const [period, setPeriod] = useState<HistoryPeriod>("threeMonths");

  const demoAgg: { total: number; correct: number } =
    HISTORY_UI_DEMO_AGGREGATES[period];
  const accuracy =
    demoAgg.total === 0
      ? 0
      : Math.round((demoAgg.correct / demoAgg.total) * 100);

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            История
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Прошедшие матчи и точность ИИ-прогнозов Claude
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
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

        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as HistoryPeriod)}
          className="mt-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 p-1">
            <TabsTrigger
              value="today"
              className="whitespace-normal px-1 py-2 text-[10px] leading-tight sm:text-xs"
            >
              Сегодня
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="whitespace-normal px-1 py-2 text-[10px] leading-tight sm:text-xs"
            >
              Неделя
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="whitespace-normal px-1 py-2 text-[10px] leading-tight sm:text-xs"
            >
              Месяц
            </TabsTrigger>
            <TabsTrigger
              value="threeMonths"
              className="whitespace-normal px-1 py-2 text-[10px] leading-tight sm:text-xs"
            >
              3 месяца
            </TabsTrigger>
          </TabsList>

          {PERIODS.map((p) => (
            <TabsContent key={p} value={p} className="mt-8">
              <HistoryGroupedList period={p} />
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-8">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Archive className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                Анализ хранится 90 дней
              </div>
              <p className="text-xs text-muted-foreground">
                Все прогнозы записываются для проверки точности модели и
                калибровки на лиги.
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

  /** Только «Сегодня» — блоки по дням; на остальных вкладках подзаголовок «Сегодня» даёт дубль. */
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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sectionTitle}
        </h2>
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
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </h3>
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

/**
 * Скользящие окна от сегодняшнего дня (00:00) назад — вложенность:
 * сегодня ≤ 7 дней ≤ 30 дней ≤ 90 дней (≈ 3 месяца).
 */
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
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  tone: "primary" | "success";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-success-muted text-success ring-1 ring-inset ring-success/30";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${toneCls}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
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
