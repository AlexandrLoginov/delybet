import { cn } from "@/lib/utils";
import type { FullAnalysis } from "@/types/analysis";
import type { Match } from "@/types/match";

function clampPct(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function confidenceLabel(
  c: FullAnalysis["recommendation"]["confidence"]
): string {
  switch (c) {
    case "HIGH":
      return "Высокая";
    case "MEDIUM":
      return "Средняя";
    case "LOW":
      return "Низкая";
    case "HIDDEN":
      return "В Pro";
    default:
      return "—";
  }
}

function segmentTone(key: string): string {
  return cn(
    "h-full min-w-[6px] rounded-full",
    key === "h" && "bg-success",
    key === "d" && "bg-muted-foreground/45",
    key === "a" && "bg-destructive"
  );
}

interface AnalysisForecastBlockProps {
  match: Match;
  analysis: FullAnalysis;
}

/** Вероятности и исход по данным анализа — на странице матча перед «Сценарии ИИ». */
export function AnalysisForecastBlock({
  match,
  analysis,
}: AnalysisForecastBlockProps) {
  const p = analysis.probabilities;
  const home = clampPct(p?.home);
  const draw = p?.draw != null ? clampPct(p.draw) : null;
  const away = clampPct(p?.away);

  const rec = analysis.recommendation;
  const headline =
    (typeof rec?.outcome === "string" && rec.outcome.trim()) ||
    "Оценка исхода по данным матча; детальные сценарии — в блоке ниже.";

  const parts: { key: string; pct: number; label: string }[] = [
    { key: "h", pct: home, label: match.home.shortName },
  ];
  if (draw != null) {
    parts.push({ key: "d", pct: draw, label: "Ничья" });
  }
  parts.push({ key: "a", pct: away, label: match.away.shortName });

  return (
    <div className="mt-4 rounded-[10px] border border-border bg-surface/60 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Прогноз ИИ
        </span>
        <span className="rounded-md border border-border bg-card px-1.5 py-px text-[10px] font-medium text-muted-foreground">
          Уверенность: {confidenceLabel(rec.confidence)}
        </span>
      </div>

      <div className="flex h-2 gap-px overflow-hidden rounded-full bg-muted">
        {parts.map((part) => (
          <div
            key={part.key}
            className={segmentTone(part.key)}
            style={{ flexGrow: Math.max(part.pct, 1), flexBasis: 0 }}
            title={`${part.label}: ~${part.pct}%`}
          />
        ))}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
        {parts.map((part) => (
          <span key={`${part.key}-lbl`} className="tabular-nums">
            <span className="text-foreground/80">{part.label}</span>
            <span className="mx-0.5">·</span>~{part.pct}%
          </span>
        ))}
      </div>

      <p className="mt-2 text-sm leading-snug text-foreground/85">{headline}</p>
    </div>
  );
}
