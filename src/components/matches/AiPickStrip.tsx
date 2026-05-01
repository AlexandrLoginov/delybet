import { LineChart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AiPick } from "@/types/match";

interface AiPickStripProps {
  pick?: AiPick;
}

const CONFIDENCE: Record<
  AiPick["confidence"],
  { label: string; cls: string }
> = {
  HIGH: {
    label: "Высокая",
    cls: "bg-success-muted text-success ring-success/30",
  },
  MEDIUM: {
    label: "Средняя",
    cls: "bg-primary/15 text-primary ring-primary/30",
  },
  LOW: {
    label: "Низкая",
    cls: "bg-muted text-muted-foreground ring-border",
  },
};

export function AiPickStrip({ pick }: AiPickStripProps) {
  if (!pick) return null;

  const conf = CONFIDENCE[pick.confidence];
  const segments = [
    { value: pick.probabilities.home, cls: "bg-success" },
    {
      value: pick.probabilities.draw ?? 0,
      cls: "bg-muted-foreground/40",
    },
    { value: pick.probabilities.away, cls: "bg-destructive" },
  ];

  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5">
      <LineChart
        className="h-3.5 w-3.5 shrink-0 text-primary"
        strokeWidth={2}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            ИИ
          </span>
          <span className="truncate text-foreground">{pick.outcome}</span>
          <span className="ml-auto tabular-num font-semibold text-foreground">
            {pick.probability}%
          </span>
        </div>
        <div className="mt-1.5 flex h-1 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((s, i) => (
            <div
              key={i}
              className={cn("h-full transition-all", s.cls)}
              style={{ width: `${s.value}%` }}
            />
          ))}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
          conf.cls
        )}
      >
        {conf.label}
      </span>
    </div>
  );
}
