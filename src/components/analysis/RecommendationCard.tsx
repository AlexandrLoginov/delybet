import { LockSimple } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  AnalysisRecommendation,
  AnalysisRecommendationScenario,
} from "@/types/analysis";

interface RecommendationCardProps {
  recommendation: AnalysisRecommendation;
  isPro: boolean;
}

function scenarioKindShort(kind?: AnalysisRecommendationScenario["kind"]) {
  switch (kind) {
    case "MATCH_RESULT":
      return null;
    case "TOTAL":
      return "Голы";
    case "BTTS":
      return "ОЗ";
    case "DOUBLE_CHANCE":
      return "ДШ";
    case "HANDICAP":
      return "Фора";
    default:
      return null;
  }
}

export function RecommendationCard({
  recommendation,
  isPro,
}: RecommendationCardProps) {
  /** Единый список строк: если с бэка пришёл массив сценариев — только он; иначе один «Исход». */
  const rows: AnalysisRecommendationScenario[] =
    recommendation.scenarios && recommendation.scenarios.length > 0
      ? recommendation.scenarios
      : [
          {
            kind: "MATCH_RESULT",
            label: "Исход",
            pick: recommendation.outcome,
            probability: null,
            confidence: recommendation.confidence,
          },
        ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Сценарии ИИ
            </span>
            <span className="text-xs text-muted-foreground">
              Исход, тоталы, обе забьют и другие разборы модели — в одном списке.
            </span>
          </div>
          {!isPro && (
            <Badge variant="pro" className="gap-1">
              <LockSimple className="h-2.5 w-2.5" weight="fill" />
              Pro
            </Badge>
          )}
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border bg-muted/20">
          {rows.map((row, i) => {
            const compact = scenarioKindShort(row.kind);

            return (
              <li key={`${row.label}-${i}`} className="space-y-1.5 px-3 py-3 sm:px-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </span>
                  {compact ? (
                    <span className="rounded-md bg-muted px-1.5 py-px text-[10px] font-semibold uppercase text-muted-foreground">
                      {compact}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-base font-semibold leading-snug text-foreground">
                    {row.pick}
                  </span>
                  {row.probability !== undefined &&
                  row.probability !== null &&
                  Number.isFinite(row.probability) ? (
                    <span className="tabular-nums text-sm text-muted-foreground">
                      · ~{Math.round(row.probability)}%
                    </span>
                  ) : null}
                </div>
                {isPro && row.reasoning ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">{row.reasoning}</p>
                ) : null}
              </li>
            );
          })}
        </ul>

        {!isPro && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Пояснения по каждому рынку и полное обоснование — в подписке Pro.
          </p>
        )}

        {isPro && recommendation.reasoning ? (
          <div className="rounded-lg border border-border bg-background/60 px-3 py-2.5 sm:px-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Общее резюме
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {recommendation.reasoning}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
