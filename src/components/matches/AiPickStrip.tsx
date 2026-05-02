import { scenariosAnalyzedCountForSport } from "@/lib/analysis-scenario-count";
import type { AiPick, SportSlug } from "@/types/match";

interface AiPickStripProps {
  pick?: AiPick;
  sport: SportSlug;
  /** Карточка истории без `aiPick` — блок со счётчиком сценариев всё равно показываем. */
  forceShow?: boolean;
  /** Завершённое событие (история): другой текст слева/справа. */
  variant?: "analysis" | "finished";
}

export function AiPickStrip({
  pick,
  sport,
  forceShow = false,
  variant = "analysis",
}: AiPickStripProps) {
  if (!pick && !forceShow) return null;

  const n = variant === "analysis" ? scenariosAnalyzedCountForSport(sport) : null;

  if (variant === "finished") {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 text-[11px]">
        <span className="min-w-0 truncate font-medium text-foreground">
          Событие завершено
        </span>
        <span className="shrink-0 font-semibold text-primary">Смотреть результаты</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-2.5 text-[11px]">
      <span className="min-w-0 truncate text-foreground">
        <span className="text-muted-foreground">Сценариев проанализировано:</span>
        <span className="ml-0.5 tabular-nums font-semibold text-foreground">{n}</span>
      </span>
      <span className="shrink-0 font-semibold text-primary">Перейти к анализу</span>
    </div>
  );
}
