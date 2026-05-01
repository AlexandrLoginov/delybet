export interface AnalysisProbabilities {
  home: number;
  draw: number | null;
  away: number;
}

export interface AnalysisRecommendation {
  outcome: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "HIDDEN";
  reasoning: string | null;
}

export interface KeyFactor {
  factor: string;
  impact: "POSITIVE_HOME" | "POSITIVE_AWAY" | "NEUTRAL";
}

export interface NewsImpact {
  headline: string;
  impact: string;
  team: string;
}

export interface MatchStatsView {
  label: string;
  home: number;
  away: number;
  unit?: string;
}

export interface FormEntry {
  result: "W" | "D" | "L";
  opponent: string;
  score: string;
}

export interface FullAnalysis {
  matchId: string;
  generatedAt: string;
  expiresAt: string;
  isLive: boolean;
  isPro: boolean;
  probabilities: AnalysisProbabilities;
  recommendation: AnalysisRecommendation;
  summary: string;
  detailedAnalysis: string;
  keyFactors: KeyFactor[];
  newsImpact: NewsImpact[];
  stats: MatchStatsView[];
  homeForm: FormEntry[];
  awayForm: FormEntry[];
}
