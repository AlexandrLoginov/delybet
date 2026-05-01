"use client";

import { useFreePreviewRedeemedIds } from "@/hooks/use-free-preview-redeemed-id";
import { cn } from "@/lib/utils";

export function SubscriptionDailyUsage() {
  const { upcoming, live } = useFreePreviewRedeemedIds();
  const upcomingUsed = upcoming ? 1 : 0;
  const liveUsed = live ? 1 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <UsageTile label="Предстоящие сегодня" used={upcomingUsed} limit={1} />
      <UsageTile label="Live сегодня" used={liveUsed} limit={1} />
    </div>
  );
}

function UsageTile({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const exceeded = used >= limit;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "tabular-num text-sm font-semibold",
            exceeded ? "text-destructive" : "text-foreground"
          )}
        >
          {used}/{limit}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            exceeded ? "bg-destructive" : "bg-success"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
