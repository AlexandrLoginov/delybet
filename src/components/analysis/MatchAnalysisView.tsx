"use client";

import Link from "next/link";
import { Calendar, ChevronLeft, LineChart, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamLogo } from "@/components/matches/TeamLogo";
import { LiveBadge } from "@/components/matches/LiveBadge";
import { ProbabilityBar } from "@/components/analysis/ProbabilityBar";
import { RecommendationCard } from "@/components/analysis/RecommendationCard";
import { KeyFactorsList } from "@/components/analysis/KeyFactorsList";
import { StatsBars } from "@/components/analysis/StatsBars";
import { FormChips } from "@/components/analysis/FormChips";
import { NewsImpactList } from "@/components/analysis/NewsImpactList";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import { formatKickoff } from "@/lib/utils";
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

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-5">
        <div className="mb-5">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
            <Link href="/matches">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Матчи
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
            {isLive ? (
              <LiveBadge minute={match.elapsedMinutes} />
            ) : (
              <Badge variant="muted" className="gap-1">
                <Calendar className="h-2.5 w-2.5" strokeWidth={2} />
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
                      <MapPin className="h-3 w-3" strokeWidth={2} />
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Вероятности
                </div>
                <Badge variant="muted" className="gap-1">
                  <LineChart className="h-2.5 w-2.5 text-primary" strokeWidth={2} />
                  ИИ-модель
                </Badge>
              </div>
              <ProbabilityBar
                probabilities={analysis.probabilities}
                homeLabel={match.home.shortName}
                awayLabel={match.away.shortName}
              />
              <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <RecommendationCard
            recommendation={analysis.recommendation}
            isPro={isPro}
          />
        </div>

        <Tabs defaultValue="stats" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="form">Форма</TabsTrigger>
            <TabsTrigger value="news">Новости</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <Card>
              <CardContent className="p-5">
                <StatsBars
                  stats={analysis.stats}
                  homeName={match.home.name}
                  awayName={match.away.name}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <FormChips team={match.home.name} entries={analysis.homeForm} />
            <FormChips team={match.away.name} entries={analysis.awayForm} />
          </TabsContent>

          <TabsContent value="news">
            <NewsImpactList items={analysis.newsImpact} />
          </TabsContent>
        </Tabs>

        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              Развёрнутый анализ
            </h2>
            {!isPro && (
              <Badge variant="pro" className="gap-1">
                <LineChart className="h-2.5 w-2.5" strokeWidth={2} />
                Pro
              </Badge>
            )}
          </div>

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
            <PaywallOverlay>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-foreground/85">
                  {analysis.detailedAnalysis}
                </p>
                <KeyFactorsList
                  factors={analysis.keyFactors}
                  homeName={match.home.shortName}
                  awayName={match.away.shortName}
                />
              </div>
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
