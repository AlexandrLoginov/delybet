import { scenariosAnalyzedCountForSport } from "@/lib/analysis-scenario-count";
import type { AiPick, SportSlug } from "@/types/match";

interface AiPickStripProps {
  pick?: AiPick;
  sport: SportSlug;
}

export function AiPickStrip({ pick, sport }: AiPickStripProps) {
  if (!pick) return null;

  const n = scenariosAnalyzedCountForSport(sport);

  return (
    <div className="flex items-center gap-2 px-5 py-2.5 text-[11px]">
      <span className="shrink-0 font-semibold uppercase tracking-wider text-muted-foreground">
        ИИ
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground">
        Сценариев проанализировано
      </span>
      <span className="shrink-0 tabular-nums font-semibold text-foreground">{n}</span>
    </div>
  );
}
