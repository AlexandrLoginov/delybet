import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  minute?: number;
  className?: string;
}

export function LiveBadge({ minute, className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-destructive ring-1 ring-inset ring-destructive/30",
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-destructive animate-live-pulse"
        aria-hidden
      />
      Live
      {typeof minute === "number" && (
        <span className="tabular-num text-destructive/80">{minute}&apos;</span>
      )}
    </span>
  );
}
