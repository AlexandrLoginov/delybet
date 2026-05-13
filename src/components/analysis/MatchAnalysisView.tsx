"use client";

import Link from "next/link";
import {
  Calendar,
  CaretLeft,
  MapPin,
  Star,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamLogo } from "@/components/matches/TeamLogo";
import { LiveBadge } from "@/components/matches/LiveBadge";
import { RecommendationCard } from "@/components/analysis/RecommendationCard";
import { KeyFactorsList } from "@/components/analysis/KeyFactorsList";
import { StatsBars } from "@/components/analysis/StatsBars";
import { FormChips } from "@/components/analysis/FormChips";
import { NewsImpactList } from "@/components/analysis/NewsImpactList";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import {
  FAVORITES_CHANGE_EVENT,
  isFavoriteMatchId,
  toggleFavoriteMatchId,
} from "@/lib/favorites";
import { cn, formatKickoff } from "@/lib/utils";
import type { Match } from "@/types/match";
import type { FullAnalysis } from "@/types/analysis";

interface MatchAnalysisViewProps {
  match: Match;
  analysis: FullAnalysis;
  isPro: boolean;
}

export function MatchAnalysisView({
  match,
  analysis,
  isPro,
}: MatchAnalysisViewProps) {
  const isLive = match.status === "live";
  const { day, time } = formatKickoff(match.kickoffISO);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const sync = () => setFavorite(isFavoriteMatchId(match.id));
    sync();
    window.addEventListener(FAVORITES_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [match.id]);

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5 flex min-h-8 items-center justify-between gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 min-w-0 shrink gap-1.5"
          >
            <Link href="/matches">
              <CaretLeft className="h-4 w-4 shrink-0" weight="fill" />
              <span className="truncate">Матчи</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "shrink-0 gap-1.5",
              favorite &&
                "border-primary/50 bg-primary/10 text-foreground hover:bg-primary/15"
            )}
            aria-pressed={favorite}
            onClick={() => {
              setFavorite(toggleFavoriteMatchId(match.id));
            }}
          >
            <Star
              weight="fill"
              className={cn(
                "h-3.5 w-3.5",
                favorite ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden
            />
            {favorite ? "В избранном" : "В избранное"}
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
            {isLive ? (
              <LiveBadge minute={match.elapsedMinutes} />
            ) : (
              <Badge variant="muted" className="gap-1">
                <Calendar className="h-2.5 w-2.5" weight="fill" />
                {day} · {time}
              </Badge>
            )}
          </div>

          <CardContent className="space-y-5 p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <TeamColumn align="left" name={match.home.name} subtitle="Дом">
                <TeamLogo team={match.home} size="xl" />
              </TeamColumn>

              <div className="flex flex-col items-center gap-1 px-2">
                {isLive ? (
                  <>
                    <div className="tabular-num text-3xl font-bold leading-none">
                      {match.scoreHome}
                      <span className="px-2 text-muted-foreground">:</span>
                      {match.scoreAway}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {match.elapsedMinutes}-я минута
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-semibold tracking-tight text-muted-foreground">
                      vs
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" weight="fill" />
                      {match.country}
                    </div>
                  </>
                )}
              </div>

              <TeamColumn align="right" name={match.away.name} subtitle="Гости">
                <TeamLogo team={match.away} size="xl" />
              </TeamColumn>
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis.summary}
            </p>
          </CardContent>
        </Card>

        <div className="mt-4">
          <RecommendationCard
            recommendation={analysis.recommendation}
            isPro={isPro}
          />
        </div>

        <section className="mt-6 space-y-2">
          <h2 className="px-1 text-base font-semibold tracking-tight">
            Ключевые факторы
          </h2>
          {isPro ? (
            <MatchDetailTabs analysis={analysis} match={match} />
          ) : (
            <PaywallOverlay
              title="Детали матча — в Pro"
              description="Статистика матча, форма команд и разбор новостей с влиянием на прогноз — после подключения подписки."
            >
              <MatchDetailTabs analysis={analysis} match={match} />
            </PaywallOverlay>
          )}
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="px-1 text-base font-semibold tracking-tight text-foreground">
            Развёрнутый анализ
          </h2>

          {isPro ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-foreground/85">
                  {analysis.detailedAnalysis}
                </p>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ключевые факторы
                  </div>
                  <KeyFactorsList
                    factors={analysis.keyFactors}
                    homeName={match.home.shortName}
                    awayName={match.away.shortName}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <PaywallOverlay
              title="Развёрнутый анализ — в Pro"
              description="Полный текст рассуждений модели, ключевые факторы и связка с новостями — после подключения подписки."
            >
              <Card className="overflow-hidden">
                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {analysis.detailedAnalysis}
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ключевые факторы
                    </div>
                    <KeyFactorsList
                      factors={analysis.keyFactors}
                      homeName={match.home.shortName}
                      awayName={match.away.shortName}
                    />
                  </div>
                </CardContent>
              </Card>
            </PaywallOverlay>
          )}
        </section>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Анализ обновлён {new Date(analysis.generatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          {" · "}
          истекает в {new Date(analysis.expiresAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </main>
    </>
  );
}

function MatchDetailTabs({
  analysis,
  match,
}: {
  analysis: FullAnalysis;
  match: Match;
}) {
  const [detailTab, setDetailTab] = useState("stats");

  return (
    <Tabs
      value={detailTab}
      onValueChange={setDetailTab}
      className="flex h-fit w-full max-w-full flex-col gap-2"
    >
      <TabsList className="grid h-auto w-full shrink-0 grid-cols-3 gap-1">
        <TabsTrigger value="stats">Статистика</TabsTrigger>
        <TabsTrigger value="form">Форма</TabsTrigger>
        <TabsTrigger value="news">Новости</TabsTrigger>
      </TabsList>

      <div className="min-h-0 w-full max-w-full shrink-0">
        {detailTab === "stats" ? (
          <Card>
            <CardContent className="p-5">
              <StatsBars
                stats={analysis.stats}
                homeName={match.home.name}
                awayName={match.away.name}
              />
            </CardContent>
          </Card>
        ) : null}

        {detailTab === "form" ? (
          <div className="space-y-4">
            <FormChips team={match.home.name} entries={analysis.homeForm} />
            <FormChips team={match.away.name} entries={analysis.awayForm} />
          </div>
        ) : null}

        {detailTab === "news" ? (
          <NewsImpactList items={analysis.newsImpact} />
        ) : null}
      </div>
    </Tabs>
  );
}

function TeamColumn({
  align,
  name,
  subtitle,
  children,
}: {
  align: "left" | "right";
  name: string;
  subtitle: string;
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
        <div className="text-sm font-semibold leading-tight">{name}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
