export interface AnalysisProbabilities {
  home: number;
  draw: number | null;
  away: number;
}

/** Разновидность рынка в блоке «сценарии ИИ» (для аналитики / отображения). */
export type RecommendationScenarioKind =
  | "MATCH_RESULT"
  | "TOTAL"
  | "BTTS"
  | "DOUBLE_CHANCE"
  | "HANDICAP"
  | "CUSTOM";

/** Один дополнительный рынок: тотал, обе забьют, форы и т.п. — в одной карточке несколько строк. */
export interface AnalysisRecommendationScenario {
  kind?: RecommendationScenarioKind;
  /** Подпись рынка, например «Тотал 2.5». */
  label: string;
  /** Прогноз ИИ человеческим языком: «ТБ 2.5», «Обе забьют — да». */
  pick: string;
  /** Оценочная вероятность 0–100 (необязательно). */
  probability?: number | null;
  /** Уверенность по этому рынку; если не задана — как у блока целиком. */
  confidence?: "HIGH" | "MEDIUM" | "LOW" | "HIDDEN";
  /** Pro: краткое пояснение именно по этому сценарию. */
  reasoning?: string | null;
}

export interface AnalysisRecommendation {
  /** Главная формулировка по исходу (1 / X / 2 или «Победа …»); для совместимости с историей и превью. */
  outcome: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "HIDDEN";
  reasoning: string | null;
  /** Дополнительные сценарии в той же карточке: тоталы, ОЗ, двойной шанс и др. */
  scenarios?: AnalysisRecommendationScenario[];
}

export interface KeyFactor {
  factor: string;
  impact: "POSITIVE_HOME" | "POSITIVE_AWAY" | "NEUTRAL";
}

/** Ссылка на первоисточник новости */
export interface NewsSource {
  /** Короткая подпись: издание, раздел */
  label?: string;
  url: string;
}

export interface NewsImpact {
  headline: string;
  impact: string;
  team: string;
  /** Полный текст / лиды новости для просмотра в шите */
  body?: string;
  sources?: NewsSource[];
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
