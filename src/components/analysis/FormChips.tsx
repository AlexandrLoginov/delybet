import { cn } from "@/lib/utils";
import type { FormEntry } from "@/types/analysis";

interface FormChipsProps {
  team: string;
  entries: FormEntry[];
}

const RESULT_STYLES: Record<FormEntry["result"], string> = {
  W: "bg-success-muted text-success ring-success/30",
  D: "bg-muted text-muted-foreground ring-border",
  L: "bg-destructive/10 text-destructive ring-destructive/30",
};

const RESULT_LABEL: Record<FormEntry["result"], string> = {
  W: "В",
  D: "Н",
  L: "П",
};

export function FormChips({ team, entries }: FormChipsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{team}</div>
        <div className="flex gap-1">
          {entries.slice(0, 5).map((e, i) => (
            <span
              key={i}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-bold ring-1 ring-inset",
                RESULT_STYLES[e.result]
              )}
              title={`${e.opponent} · ${e.score}`}
            >
              {RESULT_LABEL[e.result]}
            </span>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-border rounded-lg border bg-card">
        {entries.map((e, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 px-3 py-2"
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ring-1 ring-inset",
                RESULT_STYLES[e.result]
              )}
            >
              {RESULT_LABEL[e.result]}
            </span>
            <span className="flex-1 truncate text-sm">{e.opponent}</span>
            <span className="tabular-num text-sm font-semibold text-foreground/80">
              {e.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
