"use client";

import Link from "next/link";
import { LockSimple, MapPin } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/matches/LiveBadge";
import { TeamLogo } from "@/components/matches/TeamLogo";
import { FormPills } from "@/components/matches/FormPills";
import { AiPickStrip } from "@/components/matches/AiPickStrip";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useAppLocale } from "@/hooks/use-app-locale";
import { formatKickoff, formatTimeUntil, cn } from "@/lib/utils";
import { freePreviewKindForMatch, redeemFreePreview } from "@/lib/freemium";
import type { FormResult, Match } from "@/types/match";

interface MatchCardProps {
  match: Match;
  unlocked?: boolean;
  /** Если true и хранилище пустое, списание бесплатного просмотра по клику (до перехода). */
  consumeFreePreviewOnClick?: boolean;
}

const cardClass =
  "group relative block w-full overflow-hidden rounded-xl border bg-card text-left transition-colors";

export function MatchCard({
  match,
  unlocked = true,
  consumeFreePreviewOnClick = false,
}: MatchCardProps) {
  const { t } = useAppLocale();
  const freeHref = `/match/${match.id}`;

  if (unlocked) {
    return (
      <Link
        prefetch={false}
        href={freeHref}
        onClick={() => {
          if (consumeFreePreviewOnClick) {
            redeemFreePreview(match.id, freePreviewKindForMatch(match));
          }
        }}
        aria-label={`${match.home.name} — ${match.away.name}`}
        className={cn(cardClass, "hover:bg-accent/40")}
      >
        <MatchCardBody match={match} />
      </Link>
    );
  }

  return (
    <div className={cardClass}>
      <div
        className="pointer-events-none select-none blur-[3px]"
        aria-hidden
      >
        <MatchCardBody match={match} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-card/55 backdrop-blur-[1px]">
        <RenewSubscriptionDrawer
          intent="subscribe"
          billingAction="checkout"
          trigger={
            <Button size="sm" className="gap-1.5 shadow-none dark:shadow-lg">
              <LockSimple className="h-3.5 w-3.5" weight="fill" />
              {t("matches.openPro")}
            </Button>
          }
        />
      </div>
    </div>
  );
}

function MatchCardBody({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const { day, time } = formatKickoff(match.kickoffISO);
  const until = !isLive ? formatTimeUntil(match.kickoffISO) : null;

  return (
    <div className="relative">
      <div className="grid grid-cols-[76px_1fr] items-start gap-4 px-5 pt-3.5 pb-3">
        <div className="flex flex-col items-center justify-center gap-1 self-stretch border-r border-border pr-4">
          {isLive ? (
            <LiveBadge minute={match.elapsedMinutes} />
          ) : (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </span>
              <span className="tabular-num text-sm font-semibold text-foreground">
                {time}
              </span>
              {until && (
                <span className="text-[10px] text-muted-foreground">{until}</span>
              )}
            </>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate font-medium text-foreground/70">
              {match.league}
            </span>
            <span aria-hidden>·</span>
            <span className="truncate">{match.round}</span>
          </div>

          <TeamRow
            team={match.home}
            form={match.lastFiveHome}
            score={isLive ? match.scoreHome : undefined}
            highlighted={
              isLive && (match.scoreHome ?? 0) > (match.scoreAway ?? 0)
            }
          />
          <TeamRow
            team={match.away}
            form={match.lastFiveAway}
            score={isLive ? match.scoreAway : undefined}
            highlighted={
              isLive && (match.scoreAway ?? 0) > (match.scoreHome ?? 0)
            }
          />

          {!isLive && match.venue && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 shrink-0" weight="fill" />
              <span className="truncate">{match.venue}</span>
            </div>
          )}
        </div>
      </div>

      {match.aiPick && (
        <div className="border-t border-border">
          <AiPickStrip pick={match.aiPick} sport={match.sport} />
        </div>
      )}
    </div>
  );
}

function TeamRow({
  team,
  form,
  score,
  highlighted,
}: {
  team: Match["home"];
  form?: FormResult[];
  score?: number;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <TeamLogo team={team} size="sm" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          highlighted ? "font-semibold text-foreground" : "text-foreground/80"
        )}
      >
        {team.name}
      </span>
      {form && <FormPills results={form} />}
      {typeof score === "number" && (
        <span className="tabular-num text-sm font-semibold text-foreground">
          {score}
        </span>
      )}
    </div>
  );
}
