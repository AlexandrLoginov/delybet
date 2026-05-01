import { Equal, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { KeyFactor } from "@/types/analysis";

interface KeyFactorsListProps {
  factors: KeyFactor[];
  homeName: string;
  awayName: string;
}

export function KeyFactorsList({
  factors,
  homeName,
  awayName,
}: KeyFactorsListProps) {
  return (
    <ul className="divide-y divide-border rounded-lg border bg-background">
      {factors.map((f, i) => {
        const isHome = f.impact === "POSITIVE_HOME";
        const isAway = f.impact === "POSITIVE_AWAY";
        const Icon = isHome
          ? TrendingUp
          : isAway
          ? TrendingDown
          : Equal;
        const tone = isHome
          ? "text-success bg-success-muted ring-success/30"
          : isAway
          ? "text-destructive bg-destructive/10 ring-destructive/30"
          : "text-muted-foreground bg-muted ring-border";
        const label = isHome
          ? `+ ${homeName}`
          : isAway
          ? `+ ${awayName}`
          : "Нейтрально";

        return (
          <li key={i} className="flex items-center gap-3 p-3">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded ring-1 ring-inset",
                tone
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-snug">{f.factor}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
