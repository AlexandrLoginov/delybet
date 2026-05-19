"use client";

import { useMemo } from "react";

import { useAppLocale } from "@/hooks/use-app-locale";
import {
  localizeFullAnalysis,
  localizeHistoryMatch,
  localizeMatch,
} from "@/lib/localize-display";
import type { FullAnalysis } from "@/types/analysis";
import type { HistoryMatch, Match } from "@/types/match";

export function useLocalizedMatch(match: Match): Match {
  const { locale } = useAppLocale();
  return useMemo(() => localizeMatch(match, locale), [match, locale]);
}

export function useLocalizedHistoryMatch(match: HistoryMatch): HistoryMatch {
  const { locale } = useAppLocale();
  return useMemo(() => localizeHistoryMatch(match, locale), [match, locale]);
}

export function useLocalizedAnalysis(
  analysis: FullAnalysis,
  match: Match
): FullAnalysis {
  const { locale } = useAppLocale();
  return useMemo(
    () => localizeFullAnalysis(analysis, match, locale),
    [analysis, match, locale]
  );
}
