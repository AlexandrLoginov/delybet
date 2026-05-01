import { cn } from "@/lib/utils";
import type { FormResult } from "@/types/match";

interface FormPillsProps {
  results?: FormResult[];
  size?: "xs" | "sm";
  className?: string;
}

const TONES: Record<FormResult, string> = {
  W: "bg-success-muted text-success ring-success/30",
  D: "bg-muted text-muted-foreground ring-border",
  L: "bg-destructive/10 text-destructive ring-destructive/30",
};

const LABELS: Record<FormResult, string> = { W: "В", D: "Н", L: "П" };

export function FormPills({ results, size = "xs", className }: FormPillsProps) {
  if (!results?.length) return null;

  const dim =
    size === "sm" ? "h-5 w-5 text-[10px]" : "h-3.5 w-3.5 text-[9px]";

  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {results.map((r, i) => (
        <span
          key={i}
          title={LABELS[r]}
          className={cn(
            "flex items-center justify-center rounded-sm font-bold ring-1 ring-inset",
            dim,
            TONES[r]
          )}
        >
          {LABELS[r]}
        </span>
      ))}
    </div>
  );
}
