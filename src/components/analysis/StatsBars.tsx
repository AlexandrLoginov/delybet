"use client";

import { useAppLocale } from "@/hooks/use-app-locale";
import type { MatchStatsView } from "@/types/analysis";

interface StatsBarsProps {
  stats: MatchStatsView[];
  homeName: string;
  awayName: string;
}

export function StatsBars({ stats, homeName, awayName }: StatsBarsProps) {
  const { t } = useAppLocale();
  if (stats.length === 0) {
    return (
      <div className="space-y-3 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="truncate">{homeName}</span>
          <span className="truncate text-right">{awayName}</span>
        </div>
        <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 leading-relaxed">
          {t("analysis.statsEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="truncate">{homeName}</span>
        <span className="truncate text-right">{awayName}</span>
      </div>

      <div className="space-y-3.5">
        {stats.map((s) => {
          const total = s.home + s.away || 1;
          const homePct = (s.home / total) * 100;
          const awayPct = (s.away / total) * 100;
          const homeLeads = s.home > s.away;
          const awayLeads = s.away > s.home;
          return (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span
                  className={
                    "tabular-num font-semibold " +
                    (homeLeads ? "text-success" : "text-foreground/55")
                  }
                >
                  {s.home}
                  {s.unit ?? ""}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span
                  className={
                    "tabular-num font-semibold " +
                    (awayLeads ? "text-destructive" : "text-foreground/55")
                  }
                >
                  {s.away}
                  {s.unit ?? ""}
                </span>
              </div>
              <div className="flex h-1.5 gap-1 overflow-hidden">
                <div className="flex flex-1 justify-end">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${homePct}%` }}
                  />
                </div>
                <div className="flex flex-1 justify-start">
                  <div
                    className="h-full rounded-full bg-destructive"
                    style={{ width: `${awayPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
