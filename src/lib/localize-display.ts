import type { FullAnalysis } from "@/types/analysis";
import type { HistoryMatch, Match, Team } from "@/types/match";
import {
  getMockDisplayMaps,
  translateMockString,
  type MockDisplayMaps,
} from "@/i18n/mock-display";
import type { AppLocaleCode } from "@/lib/locale";

function localizeTeam(team: Team, maps: MockDisplayMaps | null): Team {
  if (!maps) return team;
  const name = maps.teams[String(team.id)] ?? team.name;
  return { ...team, name };
}

export function localizeMatch(match: Match, locale: AppLocaleCode): Match {
  const maps = getMockDisplayMaps(locale);
  if (!maps) return match;

  return {
    ...match,
    home: localizeTeam(match.home, maps),
    away: localizeTeam(match.away, maps),
    league: maps.leagues[match.league] ?? match.league,
    country: maps.countries[match.country] ?? match.country,
    round: maps.rounds[match.round] ?? match.round,
    venue: match.venue
      ? (maps.venues[match.venue] ?? match.venue)
      : match.venue,
    aiPick: match.aiPick
      ? {
          ...match.aiPick,
          outcome:
            maps.aiPicks[match.aiPick.outcome] ??
            translateMockString(maps, match.aiPick.outcome),
        }
      : match.aiPick,
  };
}

export function localizeHistoryMatch(
  match: HistoryMatch,
  locale: AppLocaleCode
): HistoryMatch {
  const maps = getMockDisplayMaps(locale);
  const localized = localizeMatch(match, locale);
  if (!maps) return match;

  return {
    ...match,
    home: localized.home,
    away: localized.away,
    league: localized.league,
    country: localized.country,
    round: localized.round,
    venue: localized.venue,
    aiPick: localized.aiPick,
    prediction: {
      ...match.prediction,
      outcome: translateMockString(maps, match.prediction.outcome),
      summary:
        maps.analysisByMatchId[match.id]?.summary ??
        translateMockString(maps, match.prediction.summary),
      reasoning: match.prediction.reasoning
        .split(/\n\n+/)
        .map((p) => translateMockString(maps, p))
        .join("\n\n"),
    },
  };
}

export function localizeFullAnalysis(
  analysis: FullAnalysis,
  match: Match,
  locale: AppLocaleCode
): FullAnalysis {
  const maps = getMockDisplayMaps(locale);
  if (!maps) return analysis;

  const matchOverrides = maps.analysisByMatchId[match.id];

  return {
    ...analysis,
    summary:
      matchOverrides?.summary ??
      translateMockString(maps, analysis.summary),
    detailedAnalysis:
      matchOverrides?.detailed ??
      translateMockString(maps, analysis.detailedAnalysis),
    recommendation: {
      ...analysis.recommendation,
      outcome: translateMockString(maps, analysis.recommendation.outcome),
      reasoning: analysis.recommendation.reasoning
        ? translateMockString(maps, analysis.recommendation.reasoning)
        : analysis.recommendation.reasoning,
      scenarios: analysis.recommendation.scenarios?.map((row) => ({
        ...row,
        label: translateMockString(maps, row.label),
        pick: translateMockString(maps, row.pick),
        reasoning: row.reasoning
          ? translateMockString(maps, row.reasoning)
          : row.reasoning,
      })),
    },
    keyFactors: analysis.keyFactors.map((f) => ({
      ...f,
      factor: translateMockString(maps, f.factor),
    })),
    stats: analysis.stats.map((s) => ({
      ...s,
      label: translateMockString(maps, s.label),
    })),
    homeForm: analysis.homeForm.map((e) => ({
      ...e,
      opponent: translateMockString(maps, e.opponent),
    })),
    awayForm: analysis.awayForm.map((e) => ({
      ...e,
      opponent: translateMockString(maps, e.opponent),
    })),
  };
}
