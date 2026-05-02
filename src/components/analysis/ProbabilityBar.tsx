import { cn } from "@/lib/utils";
import type { AnalysisProbabilities } from "@/types/analysis";

interface ProbabilityBarProps {
  probabilities: AnalysisProbabilities;
  homeLabel?: string;
  awayLabel?: string;
}

export function ProbabilityBar({
  probabilities,
  homeLabel = "1",
  awayLabel = "2",
}: ProbabilityBarProps) {
  const { home, draw, away } = probabilities;

  const segments =
    draw == null
      ? [
          {
            key: "home",
            value: home,
            label: homeLabel,
            barClass: "bg-success",
            chipClass:
              "bg-success-muted text-success ring-success/30",
          },
          {
            key: "away",
            value: away,
            label: awayLabel,
            barClass: "bg-destructive",
            chipClass:
              "bg-destructive/10 text-destructive ring-destructive/30",
          },
        ]
      : [
          {
            key: "home",
            value: home,
            label: homeLabel,
            barClass: "bg-success",
            chipClass:
              "bg-success-muted text-success ring-success/30",
          },
          {
            key: "draw",
            value: draw,
            label: "X",
            barClass: "bg-muted-foreground/40",
            chipClass: "bg-muted text-muted-foreground ring-border",
          },
          {
            key: "away",
            value: away,
            label: awayLabel,
            barClass: "bg-destructive",
            chipClass:
              "bg-destructive/10 text-destructive ring-destructive/30",
          },
        ];

  return (
    <div className="space-y-3">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn("h-full transition-all", s.barClass)}
            style={{ width: `${s.value}%` }}
            aria-label={`${s.label}: ${s.value}%`}
          />
        ))}
      </div>
      <div
        className={cn(
          "grid w-full gap-2 text-xs",
          segments.length === 2 ? "grid-cols-2" : "grid-cols-3"
        )}
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn(
              "flex min-w-0 w-full items-center justify-between rounded px-2.5 py-1.5 ring-1 ring-inset",
              s.chipClass
            )}
          >
            <span className="font-semibold uppercase tracking-wider">
              {s.label}
            </span>
            <span className="tabular-num font-semibold">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
