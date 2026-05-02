import Link from "next/link";
import {
  CaretLeft,
  CheckCircle,
  Target,
  XCircle,
} from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamLogo } from "@/components/matches/TeamLogo";
import { cn } from "@/lib/utils";
import type { HistoryMatch } from "@/types/match";

interface HistoryDetailViewProps {
  match: HistoryMatch;
}

export function HistoryDetailView({ match }: HistoryDetailViewProps) {
  const date = new Date(match.finishedISO);
  const dateLabel = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const predictedHomeWin = match.prediction.outcome
    .toLowerCase()
    .includes(match.home.name.toLowerCase());
  const predictedDraw = /ничь/i.test(match.prediction.outcome);
  const predicted: "HOME" | "DRAW" | "AWAY" = predictedHomeWin
    ? "HOME"
    : predictedDraw
    ? "DRAW"
    : "AWAY";
  const correct = predicted === match.actualOutcome;

  const actualLabel =
    match.actualOutcome === "HOME"
      ? `Победа ${match.home.name}`
      : match.actualOutcome === "AWAY"
      ? `Победа ${match.away.name}`
      : "Ничья";

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
            <Link href="/history">
              <CaretLeft className="h-4 w-4" weight="fill" />
              История
            </Link>
          </Button>
        </div>
        <Card>
          <div className="flex items-center justify-between border-b px-5 py-3 text-xs">
            <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <span className="truncate font-medium text-foreground/80">
                {match.league}
              </span>
              <span>·</span>
              <span className="truncate">{match.round}</span>
            </div>
            <Badge variant="muted" className="px-2">
              {dateLabel}
            </Badge>
          </div>

          <CardContent className="space-y-5 p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <TeamColumn
                align="left"
                name={match.home.name}
                won={match.actualOutcome === "HOME"}
              >
                <TeamLogo team={match.home} size="xl" />
              </TeamColumn>

              <div className="flex flex-col items-center gap-1 px-2">
                <div className="tabular-num text-3xl font-bold leading-none">
                  <span
                    className={cn(
                      match.actualOutcome === "HOME"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {match.scoreHome}
                  </span>
                  <span className="px-2 text-muted-foreground">:</span>
                  <span
                    className={cn(
                      match.actualOutcome === "AWAY"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {match.scoreAway}
                  </span>
                </div>
                <Badge variant="muted" className="mt-1">
                  Финал
                </Badge>
              </div>

              <TeamColumn
                align="right"
                name={match.away.name}
                won={match.actualOutcome === "AWAY"}
              >
                <TeamLogo team={match.away} size="xl" />
              </TeamColumn>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "mt-4 overflow-hidden border",
            correct
              ? "border-success/40 bg-success-muted/40 dark:bg-success-muted/30"
              : "border-destructive/40 bg-destructive/5"
          )}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
                correct
                  ? "bg-success-muted text-success ring-success/30"
                  : "bg-destructive/10 text-destructive ring-destructive/30"
              )}
            >
              {correct ? (
                <CheckCircle className="h-4 w-4" weight="fill" />
              ) : (
                <XCircle className="h-4 w-4" weight="fill" />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <span className="text-sm font-semibold">
                {correct
                  ? "ИИ угадал исход"
                  : "ИИ ошибся в прогнозе"}
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Прогноз: <span className="text-foreground">{match.prediction.outcome}</span>{" "}
                · Факт: <span className="text-foreground">{actualLabel}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Target className="h-3.5 w-3.5" weight="fill" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Прогноз ИИ перед матчем
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Резюме
              </div>
              <p className="text-sm leading-relaxed">
                {match.prediction.summary}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Аргументация
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {match.prediction.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ResultTile
            label={`${match.home.shortName} прогноз`}
            value={`${match.prediction.probHome}%`}
            highlighted={predicted === "HOME"}
            correct={correct && predicted === "HOME"}
          />
          <ResultTile
            label={`${match.away.shortName} прогноз`}
            value={`${match.prediction.probAway}%`}
            highlighted={predicted === "AWAY"}
            correct={correct && predicted === "AWAY"}
          />
        </div>
      </main>
    </>
  );
}

function TeamColumn({
  align,
  name,
  won,
  children,
}: {
  align: "left" | "right";
  name: string;
  won: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        align === "left"
          ? "flex flex-col items-start gap-2"
          : "flex flex-col items-end gap-2"
      }
    >
      {children}
      <div className={align === "right" ? "text-right" : ""}>
        <div
          className={cn(
            "text-sm leading-tight",
            won ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {name}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {won ? "Победа" : "—"}
        </div>
      </div>
    </div>
  );
}

function ResultTile({
  label,
  value,
  highlighted,
  correct,
}: {
  label: string;
  value: string;
  highlighted: boolean;
  correct: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        highlighted && correct && "border-success/40",
        highlighted && !correct && "border-destructive/40"
      )}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "tabular-num text-2xl font-semibold",
            highlighted && correct && "text-success",
            highlighted && !correct && "text-destructive"
          )}
        >
          {value}
        </span>
        {highlighted && (
          <Badge
            variant={correct ? "success" : "live"}
            className="gap-1 px-1.5"
          >
            {correct ? (
              <CheckCircle className="h-2.5 w-2.5" weight="fill" />
            ) : (
              <XCircle className="h-2.5 w-2.5" weight="fill" />
            )}
            Ставка ИИ
          </Badge>
        )}
      </div>
    </div>
  );
}
