"use client";

import { LockSimple } from "@phosphor-icons/react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { StatsWindowTab } from "@/lib/statistics-period";

export type CompareBarItem = {
  tab: StatsWindowTab;
  label: string;
  pct: number;
  locked?: boolean;
};

export type DailyPoint = { label: string; pct: number; total: number };

export function StatisticsCharts({
  activeTab,
  chartHeading,
  chartHint,
  compareItems,
  dailySeries,
}: {
  activeTab: StatsWindowTab;
  chartHeading: string;
  chartHint: string;
  compareItems: CompareBarItem[];
  dailySeries: DailyPoint[];
}) {
  const compareMax = Math.max(
    50,
    ...compareItems.map((i) => i.pct)
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Сравнение окон
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Доля верных прогнозов по завершённым матчам в базе; подсвечено
            выбранное окно.
          </p>
          <div
            className="mt-4 grid grid-cols-4 gap-2"
            role="img"
            aria-label="Столбчатая диаграмма точности по периодам"
          >
            {compareItems.map((item) => {
              const trackH = 88;
              const barH = Math.max(
                item.locked ? 14 : 6,
                (item.pct / compareMax) * trackH
              );
              const active = item.tab === activeTab;
              return (
                <div
                  key={item.tab}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="tabular-nums text-[10px] font-semibold leading-none text-foreground min-h-[14px]">
                    {item.locked ? (
                      <LockSimple
                        className="mx-auto h-3.5 w-3.5 text-muted-foreground"
                        weight="fill"
                        aria-label="Только в Pro"
                      />
                    ) : (
                      `${item.pct}%`
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex w-full flex-col justify-end rounded-md bg-muted/60 p-1",
                      active && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    )}
                    style={{ height: trackH }}
                  >
                    <div
                      className={cn(
                        "w-full min-h-[4px] rounded-sm transition-all",
                        item.locked
                          ? "bg-muted-foreground/35"
                          : "bg-primary"
                      )}
                      style={{ height: barH }}
                    />
                  </div>
                  <span className="text-[9px] font-medium leading-tight text-muted-foreground sm:text-[10px]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {chartHeading}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{chartHint}</p>
          {dailySeries.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Нет матчей за этот период
            </div>
          ) : dailySeries.length === 1 ? (
            <SingleDayBar point={dailySeries[0]!} />
          ) : (
            <DailyLineChart points={dailySeries} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SingleDayBar({ point }: { point: DailyPoint }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-end justify-between gap-2">
        <span className="text-xs text-muted-foreground">{point.label}</span>
        <span className="tabular-nums text-sm font-semibold text-foreground">
          {point.pct}% · {point.total} матч.
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${point.pct}%` }}
        />
      </div>
    </div>
  );
}

function shouldShowXLabel(i: number, len: number): boolean {
  if (len <= 6) return true;
  if (i === 0 || i === len - 1) return true;
  return i % 2 === 0;
}

function DailyLineChart({ points }: { points: DailyPoint[] }) {
  const w = 320;
  const h = 120;
  const pad = { t: 16, r: 12, b: 28, l: 12 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const maxPct = Math.max(55, ...points.map((p) => p.pct));
  const minPct = Math.max(0, Math.min(...points.map((p) => p.pct)) - 8);

  const coords = points.map((p, i) => {
    const x = pad.l + (i / Math.max(1, points.length - 1)) * iw;
    const yNorm = (p.pct - minPct) / Math.max(1, maxPct - minPct);
    const y = pad.t + ih - yNorm * ih;
    return { x, y, ...p };
  });

  const lineD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const areaD = `${lineD} L ${last.x.toFixed(1)} ${pad.t + ih} L ${first.x.toFixed(1)} ${pad.t + ih} Z`;

  return (
    <svg
      className="mt-3 w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="График точности по дням"
    >
      <title>Динамика точности по дням</title>
      <defs>
        <linearGradient id="stats-area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#stats-area-fill)" />
      <path
        d={lineD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map((c, i) => (
        <circle
          key={`${c.label}-${i}`}
          cx={c.x}
          cy={c.y}
          r={3.5}
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      ))}
      {coords.map((c, i) =>
        shouldShowXLabel(i, coords.length) ? (
          <text
            key={`t-${c.label}-${i}`}
            x={c.x}
            y={h - 6}
            textAnchor={
              i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle"
            }
            fill="hsl(var(--muted-foreground))"
            className="text-[8px] font-medium sm:text-[9px]"
          >
            {c.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
