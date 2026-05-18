"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppLocale } from "@/hooks/use-app-locale";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import { analysisBlockClass } from "@/lib/analysis-ui";
import { cn } from "@/lib/utils";
import type {
  AnalysisRecommendation,
  AnalysisRecommendationScenario,
} from "@/types/analysis";

interface RecommendationCardProps {
  recommendation: AnalysisRecommendation;
  isPro: boolean;
}

function scenarioKindShort(
  kind: AnalysisRecommendationScenario["kind"] | undefined,
  t: (key: string) => string
) {
  switch (kind) {
    case "MATCH_RESULT":
      return null;
    case "TOTAL":
      return t("analysis.scenarioTotal");
    case "BTTS":
      return t("analysis.scenarioBTTS");
    case "DOUBLE_CHANCE":
      return t("analysis.scenarioDoubleChance");
    case "HANDICAP":
      return t("analysis.scenarioHandicap");
    default:
      return null;
  }
}

function SingleScenarioCard({
  row,
  showReasoning,
  t,
}: {
  row: AnalysisRecommendationScenario;
  showReasoning: boolean;
  t: (key: string) => string;
}) {
  const compact = scenarioKindShort(row.kind, t);

  return (
    <Card className={cn(analysisBlockClass, "overflow-hidden")}>
      <CardContent className="space-y-2 p-4 sm:p-5">
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
        {showReasoning && row.reasoning ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {row.reasoning}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RecommendationCard({
  recommendation,
  isPro,
}: RecommendationCardProps) {
  const { t } = useAppLocale();
  const rows: AnalysisRecommendationScenario[] =
    recommendation.scenarios && recommendation.scenarios.length > 0
      ? recommendation.scenarios
      : [
          {
            kind: "MATCH_RESULT",
            label: t("analysis.outcomeLabel"),
            pick: recommendation.outcome,
            probability: null,
            confidence: recommendation.confidence,
          },
        ];

  const scenarioStack = (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <SingleScenarioCard
          key={`${row.label}-${row.kind ?? "custom"}-${i}`}
          row={row}
          showReasoning={isPro}
          t={t}
        />
      ))}
    </div>
  );

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-base font-semibold tracking-tight text-foreground">
        {t("analysis.recommendation")}
      </h2>

      {isPro ? (
        <>
          {scenarioStack}

          {recommendation.reasoning ? (
            <Card className={cn(analysisBlockClass, "overflow-hidden")}>
              <CardContent className="space-y-1.5 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("analysis.generalSummary")}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {recommendation.reasoning}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <PaywallOverlay
          title={t("paywall.title")}
          description={t("paywall.description")}
        >
          {scenarioStack}
        </PaywallOverlay>
      )}
    </section>
  );
}
