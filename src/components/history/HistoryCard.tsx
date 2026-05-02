import Link from "next/link";

import { AiPickStrip } from "@/components/matches/AiPickStrip";
import { TeamLogo } from "@/components/matches/TeamLogo";
import { FormPills } from "@/components/matches/FormPills";
import { cn } from "@/lib/utils";
import type { HistoryMatch } from "@/types/match";

interface HistoryCardProps {
  match: HistoryMatch;
}

export function HistoryCard({ match }: HistoryCardProps) {
  const finished = new Date(match.finishedISO);
  const dateLabel = finished.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/history/${match.id}`}
      aria-label={`Результат: ${match.home.name} vs ${match.away.name}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/40"
    >
      <div className="grid grid-cols-[76px_1fr] items-start gap-4 px-5 pt-3.5 pb-3">
        <div className="flex flex-col items-center justify-center gap-1 self-stretch border-r border-border py-0.5 pr-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {dateLabel}
          </span>
          <span className="text-[10px] font-semibold text-foreground">Завершено</span>
        </div>

        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate font-medium text-foreground/70">
              {match.league}
            </span>
            <span aria-hidden>·</span>
            <span className="truncate">{match.round}</span>
          </div>

          <ResultRow
            team={match.home}
            score={match.scoreHome}
            form={match.lastFiveHome}
            won={match.actualOutcome === "HOME"}
          />
          <ResultRow
            team={match.away}
            score={match.scoreAway}
            form={match.lastFiveAway}
            won={match.actualOutcome === "AWAY"}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <AiPickStrip pick={match.aiPick} sport={match.sport} forceShow />
      </div>
    </Link>
  );
}

function ResultRow({
  team,
  score,
  form,
  won,
}: {
  team: HistoryMatch["home"];
  score: number;
  form?: HistoryMatch["lastFiveHome"];
  won: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <TeamLogo team={team} size="sm" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          won ? "font-semibold text-foreground" : "text-foreground/70"
        )}
      >
        {team.name}
      </span>
      {form && <FormPills results={form} className="opacity-80" />}
      <span
        className={cn(
          "tabular-num text-base",
          won
            ? "font-bold text-foreground"
            : "font-semibold text-foreground/60"
        )}
      >
        {score}
      </span>
    </div>
  );
}
