import { Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnalysisRecommendation } from "@/types/analysis";

interface RecommendationCardProps {
  recommendation: AnalysisRecommendation;
  isPro: boolean;
}

const CONFIDENCE_LABEL: Record<
  AnalysisRecommendation["confidence"],
  { label: string; tone: string }
> = {
  HIGH: { label: "Высокая уверенность", tone: "text-success" },
  MEDIUM: { label: "Средняя уверенность", tone: "text-primary" },
  LOW: { label: "Низкая уверенность", tone: "text-muted-foreground" },
  HIDDEN: { label: "Скрыто", tone: "text-muted-foreground" },
};

export function RecommendationCard({
  recommendation,
  isPro,
}: RecommendationCardProps) {
  const conf = CONFIDENCE_LABEL[recommendation.confidence];

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Рекомендация ИИ
              </span>
              {isPro ? (
                <span className={cn("text-xs font-medium", conf.tone)}>
                  {conf.label}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  на основе формы, статистики и новостей
                </span>
              )}
            </div>
          </div>
          {!isPro && (
            <Badge variant="pro" className="gap-1">
              <Lock className="h-2.5 w-2.5" strokeWidth={2} />
              Pro
            </Badge>
          )}
        </div>

        <div className="text-xl font-semibold leading-snug tracking-tight">
          {recommendation.outcome}
        </div>

        {isPro && recommendation.reasoning && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {recommendation.reasoning}
          </p>
        )}

        {!isPro && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Полное обоснование, ключевые факторы и влияние новостей доступны в
            Pro.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
