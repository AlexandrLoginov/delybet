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
import type { Confidence, HistoryMatch } from "@/types/match";

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

  const reasoningBlocks = match.prediction.reasoning.split(/\n\n+/).filter(Boolean);

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

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-3 text-xs">
            <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <span className="truncate font-medium text-foreground/80">
                {match.league}
              </span>
              <span>·</span>
              <span className="truncate">{match.round}</span>
            </div>
            <Badge variant="muted" className="px-2 shrink-0">
              {dateLabel}
            </Badge>
          </div>

          <CardContent className="p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Результат матча
            </p>
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
                  Завершён
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

        <Card className="mt-4 overflow-hidden">
          <div className="border-b px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Сводка против прогноза
            </p>
          </div>
          <CardContent className="p-5">
            <div className="flex justify-center px-1">
              <div className="flex max-w-md items-center gap-3 md:gap-4">
                {correct ? (
                  <CheckCircle
                    className="h-11 w-11 shrink-0 text-success md:h-12 md:w-12"
                    weight="fill"
                    aria-hidden
                  />
                ) : (
                  <XCircle
                    className="h-11 w-11 shrink-0 text-destructive md:h-12 md:w-12"
                    weight="fill"
                    aria-hidden
                  />
                )}
                <div className="flex min-w-0 flex-col gap-1.5 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {correct ? "ИИ угадал исход" : "ИИ не угадал исход"}
                  </p>
                  <p className="text-balance text-sm text-muted-foreground">
                    Прогноз:&nbsp;
                    <span className="break-words text-foreground">
                      {match.prediction.outcome}
                    </span>
                  </p>
                  <p className="text-balance text-xs text-muted-foreground">
                    Факт:&nbsp;
                    <span className="text-foreground">{actualLabel}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Target className="h-3.5 w-3.5" weight="fill" />
              </div>
              <div className="min-w-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Прогноз ИИ перед матчем
              </div>
            </div>
            <HistoryConfidenceBadge confidence={match.prediction.confidence} />
          </div>

          <CardContent className="space-y-5 p-5">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Распределение вероятностей (прематч)
              </p>
              <HistoryProbStrip match={match} />
              <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                <span>
                  Дом:&nbsp;
                  <span className="font-semibold tabular-nums text-foreground">
                    {match.prediction.probHome}%
                  </span>
                </span>
                {match.prediction.probDraw !== null ? (
                  <span>
                    Ничья:&nbsp;
                    <span className="font-semibold tabular-nums text-foreground">
                      {match.prediction.probDraw}%
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/70">Без маркета ничьей</span>
                )}
                <span className="ml-auto md:ml-0">
                  Гости:&nbsp;
                  <span className="font-semibold tabular-nums text-foreground">
                    {match.prediction.probAway}%
                  </span>
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
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

            <Separator />

            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Прематчевое резюме
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {match.prediction.summary}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Структурное обоснование модели
              </div>
              <div className="space-y-3">
                {reasoningBlocks.map((block, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {block}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function HistoryConfidenceBadge({ confidence }: { confidence: Confidence }) {
  switch (confidence) {
    case "HIGH":
      return (
        <Badge variant="success" className="shrink-0 px-2">
          Высокая уверенность
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="muted" className="shrink-0 border border-border px-2">
          Сдержанная уверенность
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="shrink-0 px-2">
          Умеренная уверенность
        </Badge>
      );
  }
}

function HistoryProbStrip({ match }: { match: HistoryMatch }) {
  const { probHome, probDraw, probAway } = match.prediction;

  return (
    <div
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/80 ring-1 ring-inset ring-border/60"
      role="presentation"
      aria-hidden
    >
      <span
        className="block h-full shrink-0 bg-success"
        style={{ width: `${probHome}%` }}
      />
      {probDraw !== null ? (
        <span
          className="block h-full shrink-0 bg-muted-foreground/30"
          style={{ width: `${probDraw}%` }}
        />
      ) : null}
      <span
        className="block h-full shrink-0 bg-primary"
        style={{ width: `${probAway}%` }}
      />
    </div>
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
        "rounded-xl border bg-muted/25 p-4",
        highlighted && correct && "border-success/45 bg-success-muted/25",
        highlighted && !correct && "border-destructive/35 bg-destructive/5"
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
