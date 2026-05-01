import { Radio } from "lucide-react";

import type { NewsImpact } from "@/types/analysis";

interface NewsImpactListProps {
  items: NewsImpact[];
}

export function NewsImpactList({ items }: NewsImpactListProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
        Нет данных о влиянии новостей на матч.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Radio className="h-4 w-4 text-foreground/80" strokeWidth={2} />
        Связка с медиафоном
      </div>

      <ul className="space-y-2">
        {items.map((n, idx) => (
          <li
            key={`${idx}-${n.headline}`}
            className="rounded-lg border bg-background px-3 py-2.5"
          >
            <div className="text-[11px] text-muted-foreground">{n.team}</div>
            <div className="mt-1 text-sm font-medium">{n.headline}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {n.impact}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
