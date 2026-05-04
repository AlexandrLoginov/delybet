"use client";

import { useState } from "react";
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

/** Типографика как у интервала в карточках («4 апр. – 9 апр.»). */
const STATS_INTERVAL_CAPTION = "text-xs font-normal leading-none";

function SeriesPointPlaque({
  label,
  pct,
  total,
  active,
  onClick,
}: {
  label: string;
  pct: number;
  total: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors",
    onClick &&
      "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer hover:bg-muted/40",
    active && "ring-2 ring-primary ring-offset-2 ring-offset-card"
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cls}
        aria-pressed={active ?? false}
      >
        <div className={cn(STATS_INTERVAL_CAPTION, "text-muted-foreground")}>
          {label}
        </div>
        <div className="mt-0.5 tabular-nums font-semibold text-foreground">
          {pct}% · {total} матч.
        </div>
      </button>
    );
  }
  return (
    <div className={cls}>
      <div className={cn(STATS_INTERVAL_CAPTION, "text-muted-foreground")}>
        {label}
      </div>
      <div className="mt-0.5 tabular-nums font-semibold text-foreground">
        {pct}% · {total} матч.
      </div>
    </div>
  );
}

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
                      active &&
                        "ring-1 ring-foreground/25 ring-offset-2 ring-offset-card"
                    )}
                    style={{ height: trackH }}
                  >
                    <div
                      className={cn(
                        "w-full min-h-[4px] rounded-sm transition-all",
                        item.locked
                          ? "bg-muted-foreground/35"
                          : "bg-foreground"
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
    <div className="mt-4 space-y-3">
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${point.pct}%` }}
        />
      </div>
      <SeriesPointPlaque label={point.label} pct={point.pct} total={point.total} />
    </div>
  );
}

function DailyLineChart({ points }: { points: DailyPoint[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const w = 320;
  const h = 120;
  const pad = { t: 16, r: 12, b: 14 };
  /** Левый край линии/сетки; шире базового отступа — зазор между подписями % и графиком. */
  const plotPadLeft = 46;
  const labelAnchorX = plotPadLeft - 16;
  const iw = w - plotPadLeft - pad.r;
  const ih = h - pad.t - pad.b;
  const maxPct = Math.max(55, ...points.map((p) => p.pct));
  const minPct = Math.max(0, Math.min(...points.map((p) => p.pct)) - 8);
  const spanPct = Math.max(1e-6, maxPct - minPct);

  const yTicks = (() => {
    const n = 5;
    const raw = Array.from({ length: n }, (_, i) =>
      Math.round(maxPct - (i / (n - 1)) * spanPct)
    );
    return [...new Set(raw)].sort((a, b) => b - a);
  })();

  const pctToY = (pct: number) =>
    pad.t + ih - ((pct - minPct) / spanPct) * ih;

  const coords = points.map((p, i) => {
    const x = plotPadLeft + (i / Math.max(1, points.length - 1)) * iw;
    const yNorm = (p.pct - minPct) / spanPct;
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
    <div className="mt-3 w-full min-w-0">
      <svg
        className="block h-auto w-full max-w-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-label="График точности по дням"
      >
        <title>Динамика точности по дням</title>
        <defs>
          <linearGradient id="stats-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => {
          const gy = pctToY(tick);
          return (
            <line
              key={`grid-${tick}`}
              x1={plotPadLeft}
              y1={gy}
              x2={w - pad.r}
              y2={gy}
              stroke="hsl(var(--border))"
              strokeOpacity={0.45}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        <path d={areaD} fill="url(#stats-area-fill)" />
        <path
          d={lineD}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeOpacity={0.42}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) => {
          const active = selectedIndex === i;
          return (
            <g key={`${c.label}-${i}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => setSelectedIndex(i)}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 4.5 : 3.5}
                fill="hsl(var(--card))"
                stroke={
                  active
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))"
                }
                strokeWidth={active ? 2.5 : 2}
                className="pointer-events-none"
              />
            </g>
          );
        })}
        {yTicks.map((tick) => (
          <text
            key={`y-${tick}`}
            x={labelAnchorX}
            y={pctToY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            className="tabular-nums text-[0.5rem] font-normal leading-none"
          >
            {tick}%
          </text>
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {points.map((p, i) => (
          <SeriesPointPlaque
            key={`${p.label}-${i}`}
            label={p.label}
            pct={p.pct}
            total={p.total}
            active={selectedIndex === i}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
