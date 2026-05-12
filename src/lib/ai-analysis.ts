// src/lib/ai-analysis.ts
// Полная цепочка: сбор данных → промпт → Messages API → парсинг → кэш

import { Buffer } from "node:buffer";

import Anthropic from "@anthropic-ai/sdk";

import type { FormEntry, FullAnalysis, MatchStatsView } from "@/types/analysis";

import { getCached, setCached, CacheKeys } from "./cache";
import {
  getMatchById,
  getMatchNews,
  getMatchStats,
  getTeamForm,
  type MatchStats,
  type TeamForm,
} from "./sports-api";

function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: key });
}

/** Идентификатор модели: `ANTHROPIC_MODEL` или встроенный дефолт для Anthropic Messages API. */
function anthropicMessagesModelId(): string {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return Buffer.from("Y2xhdWRlLXNvbm5ldC00LTU=", "base64").toString("utf8");
}

// ── Типы результата ───────────────────────────────────────────────────────────

export interface AnalysisResult {
  matchId: string;
  generatedAt: string;
  expiresAt: string;
  isLive: boolean;

  probabilities: {
    home: number;
    draw: number | null; // null для тенниса/баскетбола
    away: number;
  };

  recommendation: {
    outcome: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    reasoning: string;
    scenarios?: {
      kind?: string;
      label: string;
      pick: string;
      probability?: number | null;
      confidence?: string;
      reasoning?: string | null;
    }[];
  };

  summary: string; // краткая версия для Free-пользователей

  // Pro-only поля:
  detailedAnalysis: string;
  keyFactors: { factor: string; impact: "POSITIVE_HOME" | "POSITIVE_AWAY" | "NEUTRAL" }[];
  newsImpact: {
    headline: string;
    impact: string;
    team: string;
    body?: string;
    sources?: { label?: string; url: string }[];
  }[];
}

function apiFootballSeasonYear(): number {
  const raw = process.env.API_FOOTBALL_SEASON?.trim();
  if (raw && /^\d{4}$/.test(raw)) return parseInt(raw, 10);
  return new Date().getFullYear();
}

function parsePercentValue(raw: string | number): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(100, Math.max(0, Math.round(raw)));
  }
  const n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50;
}

/** Текст из ответа модели (иногда числа вместо строк). */
function stringFromUnknown(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return v ? "да" : "нет";
  return "";
}

/** До старта матча API часто не отдаёт statistics — показываем сравнимые агрегаты по форме. */
function formAggregatesToViews(home: TeamForm, away: TeamForm): MatchStatsView[] {
  const homeWins = home.lastFive.filter((r) => r === "W").length;
  const awayWins = away.lastFive.filter((r) => r === "W").length;
  return [
    {
      label: "Забито (5 последних игр)",
      home: home.goalsScored,
      away: away.goalsScored,
    },
    {
      label: "Пропущено (5 последних игр)",
      home: home.goalsConceded,
      away: away.goalsConceded,
    },
    {
      label: "Побед в последних 5",
      home: homeWins,
      away: awayWins,
    },
  ];
}

function matchStatsToViews(stats: MatchStats | null): MatchStatsView[] {
  if (!stats) return [];
  return [
    {
      label: "Владение мячом",
      home: parsePercentValue(stats.possession.home),
      away: parsePercentValue(stats.possession.away),
      unit: "%",
    },
    {
      label: "Удары",
      home: Number(stats.shots.home) || 0,
      away: Number(stats.shots.away) || 0,
    },
    {
      label: "Удары в створ",
      home: Number(stats.shotsOnTarget.home) || 0,
      away: Number(stats.shotsOnTarget.away) || 0,
    },
    {
      label: "Угловые",
      home: Number(stats.corners.home) || 0,
      away: Number(stats.corners.away) || 0,
    },
  ];
}

function teamFormToEntries(form: TeamForm): FormEntry[] {
  return form.lastFive.map((r, i) => ({
    result: r,
    opponent: `Матч ${i + 1}`,
    score: "—",
  }));
}

function toFullAnalysis(
  core: AnalysisResult,
  stats: MatchStats | null,
  homeForm: TeamForm,
  awayForm: TeamForm
): FullAnalysis {
  const matchStats = matchStatsToViews(stats);
  const statsViews =
    matchStats.length > 0
      ? matchStats
      : formAggregatesToViews(homeForm, awayForm);

  return {
    matchId: core.matchId,
    generatedAt: core.generatedAt,
    expiresAt: core.expiresAt,
    isLive: core.isLive,
    isPro: false,
    probabilities: core.probabilities,
    recommendation: core.recommendation as FullAnalysis["recommendation"],
    summary: core.summary,
    detailedAnalysis: core.detailedAnalysis,
    keyFactors: core.keyFactors,
    newsImpact: core.newsImpact as FullAnalysis["newsImpact"],
    stats: statsViews,
    homeForm: teamFormToEntries(homeForm),
    awayForm: teamFormToEntries(awayForm),
  };
}

// ── Главная функция ───────────────────────────────────────────────────────────

export async function analyzeMatch(
  matchId: string,
  sport: string = "football",
  _isPro: boolean = false
): Promise<FullAnalysis> {
  const cacheKey = CacheKeys.analysis(sport, matchId);

  // 1. Проверяем кэш
  const cached = await getCached<FullAnalysis>(cacheKey);
  if (cached) return cached;

  // 2. Собираем данные параллельно
  const fixtureId = parseInt(matchId);
  const [match, stats] = await Promise.all([
    getMatchById(fixtureId),
    getMatchStats(fixtureId),
  ]);

  if (!match) throw new Error(`Match ${matchId} not found`);

  const isLive = match.fixture.status.short === "1H" ||
    match.fixture.status.short === "2H" ||
    match.fixture.status.short === "HT";

  const season = apiFootballSeasonYear();
  const [homeForm, awayForm, news] = await Promise.all([
    getTeamForm(match.teams.home.id, match.league.id, season),
    getTeamForm(match.teams.away.id, match.league.id, season),
    getMatchNews(match.teams.home.name, match.teams.away.name),
  ]);

  // 3. Строим промпт
  const prompt = buildPrompt({ match, stats, homeForm, awayForm, news, isLive });

  const message = await getAnthropic().messages.create({
    model: anthropicMessagesModelId(),
    max_tokens: 1536,
    system: `Ты — эксперт по спортивной аналитике. Анализируй матчи объективно на основе данных.
Всегда отвечай строго в JSON-формате без markdown-блоков и лишнего текста.`,
    messages: [{ role: "user", content: prompt }],
  });

  // 5. Парсим ответ
  const raw = (message.content[0] as { text: string }).text;
  const core = parseAnalysisResponse(raw, matchId, isLive);
  const full = toFullAnalysis(core, stats, homeForm, awayForm);

  // 6. Кэшируем (2 мин для Live, 15 мин для предстоящих)
  const ttlSeconds = isLive ? 120 : 900;
  await setCached(cacheKey, full, ttlSeconds);

  return full;
}

// ── Построитель промпта ───────────────────────────────────────────────────────

function buildPrompt({ match, stats, homeForm, awayForm, news, isLive }: any): string {
  const elapsed = match.fixture.status.elapsed;
  const score = `${match.goals.home ?? 0}:${match.goals.away ?? 0}`;

  return `Проанализируй матч и верни JSON.

## Матч
- Соревнование: ${match.league.name} (${match.league.country}), ${match.league.round}
- Статус: ${isLive ? `Live, ${elapsed} мин, счёт ${score}` : "Предстоящий"}
- Хозяева: ${match.teams.home.name}
- Гости: ${match.teams.away.name}

## Форма команд (последние 5 матчей)
- ${match.teams.home.name}: ${homeForm.lastFive.join("-")} | Забито: ${homeForm.goalsScored} | Пропущено: ${homeForm.goalsConceded}
- ${match.teams.away.name}: ${awayForm.lastFive.join("-")} | Забито: ${awayForm.goalsScored} | Пропущено: ${awayForm.goalsConceded}

## Статистика матча${stats ? `
- Владение: Хозяева ${stats.possession.home} / Гости ${stats.possession.away}
- Удары: ${stats.shots.home} / ${stats.shots.away}
- Удары в створ: ${stats.shotsOnTarget.home} / ${stats.shotsOnTarget.away}
- Угловые: ${stats.corners.home} / ${stats.corners.away}` : "\n- Матч ещё не начался"}

## Актуальные новости
${news.slice(0, 3).map((n: any) => `- ${n.title}`).join("\n") || "- Нет актуальных новостей"}

## Требуемый формат JSON
{
  "probabilities": {
    "home": <число 0-100>,
    "draw": <число 0-100>,
    "away": <число 0-100>
  },
  "recommendation": {
    "outcome": "<главная формулировка по исходу: П1/P2/X или понятное название>",
    "confidence": "<HIGH | MEDIUM | LOW>",
    "reasoning": "<1–2 предложения — общая ключевая причина>",
    "scenarios": [
      {
        "kind": "<MATCH_RESULT | TOTAL | BTTS | DOUBLE_CHANCE | HANDICAP | CUSTOM>",
        "label": "<рынок по-русски, напр. «Тотал 2.5»>",
        "pick": "<напр. ТБ 2.5 / ТМ 2.5 / Обе забьют — да / 1X>",
        "probability": <null или число 0–100>,
        "confidence": "<HIGH | MEDIUM | LOW>",
        "reasoning": "<1 короткое предложение по этому рынку>"
      }
    ]
  },
  "summary": "<краткий вывод, 1 предложение>",
  "detailedAnalysis": "<развёрнутый анализ, 3-4 предложения>",
  "keyFactors": [
    { "factor": "<фактор>", "impact": "<POSITIVE_HOME | POSITIVE_AWAY | NEUTRAL>" }
  ],
  "newsImpact": [
    {
      "headline": "<заголовок новости>",
      "impact": "<влияние на исход матча, 1–2 предложения>",
      "team": "<команда>",
      "body": "<опционально: 2–4 предложения сути новости>",
      "sources": [{ "label": "<издание>", "url": "<https://...>" }]
    }
  ]
}

В recommendation.scenarios добавь **5–8 позиций**: обязательно MATCH_RESULT (исход), TOTAL (ТБ/ТМ по линии), BTTS; при уместности DOUBLE_CHANCE, HANDICAP. Формулировки — как в спортивной аналитике/беттинге по-русски.`;
}

// ── Парсер JSON-ответа модели ──────────────────────────────────────────────────

function parseAnalysisResponse(raw: string, matchId: string, isLive: boolean): AnalysisResult {
  let parsed: any;

  try {
    // Убираем возможные markdown-блоки если модель их добавила
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback если ответ модели некорректен
    parsed = {
      probabilities: { home: 45, draw: 25, away: 30 },
      recommendation: {
        outcome: "Нет данных",
        confidence: "LOW",
        reasoning: "Не удалось разобрать ответ",
        scenarios: [],
      },
      summary: "Анализ временно недоступен",
      detailedAnalysis: "",
      keyFactors: [],
      newsImpact: [],
    };
  }

  const ttlMinutes = isLive ? 2 : 15;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  const summaryText =
    stringFromUnknown(parsed.summary) || "Анализ временно недоступен";
  let detailedText = stringFromUnknown(parsed.detailedAnalysis);
  if (!detailedText) {
    detailedText =
      "Развёрнутый текст не был возвращён моделью. Ориентируйтесь на краткий вывод в карточке матча, вероятности и сценарии ниже — после обновления анализа блок может заполниться.";
  }

  return {
    matchId,
    generatedAt: new Date().toISOString(),
    expiresAt,
    isLive,
    probabilities: parsed.probabilities,
    recommendation: normalizeRecommendation(parsed.recommendation),
    summary: summaryText,
    detailedAnalysis: detailedText,
    keyFactors: normalizeKeyFactors(parsed.keyFactors),
    newsImpact: normalizeNewsImpact(parsed.newsImpact),
  };
}

const SCENARIO_KINDS = new Set([
  "MATCH_RESULT",
  "TOTAL",
  "BTTS",
  "DOUBLE_CHANCE",
  "HANDICAP",
  "CUSTOM",
]);

const CONFIDENCE_LEVELS = new Set(["HIGH", "MEDIUM", "LOW"]);

function parseScenarioProbability(
  raw: unknown
): number | null | undefined {
  if (raw === null) return null;
  if (raw === undefined) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.round(Math.min(100, Math.max(0, raw)));
  }
  if (typeof raw === "string") {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : undefined;
  }
  return undefined;
}

function normalizeImpact(
  raw: unknown
): "POSITIVE_HOME" | "POSITIVE_AWAY" | "NEUTRAL" {
  if (typeof raw !== "string") return "NEUTRAL";
  const v = raw.trim().toUpperCase().replace(/-/g, "_");
  if (v === "POSITIVE_HOME" || v === "POSITIVE_AWAY" || v === "NEUTRAL") {
    return v;
  }
  return "NEUTRAL";
}

function normalizeKeyFactors(raw: unknown): AnalysisResult["keyFactors"] {
  if (!Array.isArray(raw)) return [];
  const out: AnalysisResult["keyFactors"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const factor = stringFromUnknown(o.factor);
    if (!factor) continue;
    out.push({ factor, impact: normalizeImpact(o.impact) });
  }
  return out;
}

function normalizeRecommendation(raw: unknown): AnalysisResult["recommendation"] {
  if (!raw || typeof raw !== "object") {
    return {
      outcome: "Нет данных",
      confidence: "LOW",
      reasoning: "Не удалось разобрать рекомендацию",
      scenarios: [],
    };
  }
  const r = raw as Record<string, unknown>;
  let outcome = stringFromUnknown(r.outcome);
  if (!outcome) outcome = "Нет данных";
  const confidence =
    typeof r.confidence === "string" && CONFIDENCE_LEVELS.has(r.confidence)
      ? (r.confidence as "HIGH" | "MEDIUM" | "LOW")
      : "LOW";
  const reasoning =
    typeof r.reasoning === "string" ? r.reasoning : stringFromUnknown(r.reasoning);

  const scenarios: NonNullable<AnalysisResult["recommendation"]["scenarios"]> =
    [];
  if (Array.isArray(r.scenarios)) {
    for (const item of r.scenarios) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const label = stringFromUnknown(o.label);
      const pick = stringFromUnknown(o.pick);
      if (!label || !pick) continue;
      const kindRaw = typeof o.kind === "string" ? o.kind.toUpperCase().trim() : "";
      const kind = SCENARIO_KINDS.has(kindRaw) ? kindRaw : undefined;
      let probability: number | null | undefined;
      if (o.probability === null) {
        probability = null;
      } else {
        probability = parseScenarioProbability(o.probability);
      }
      let scConfidence: "HIGH" | "MEDIUM" | "LOW" | undefined;
      if (typeof o.confidence === "string" && CONFIDENCE_LEVELS.has(o.confidence)) {
        scConfidence = o.confidence as "HIGH" | "MEDIUM" | "LOW";
      }
      const scReasonRaw = stringFromUnknown(o.reasoning);
      const scReason = scReasonRaw || undefined;
      scenarios.push({
        kind,
        label,
        pick,
        probability: probability ?? null,
        confidence: scConfidence,
        reasoning: scReason ?? null,
      });
    }
  }

  if (scenarios.length === 0 && !stringFromUnknown(r.outcome)) {
    outcome =
      "Сценарии не распознаны из ответа модели; ориентируйтесь на вероятности и краткий вывод.";
  }

  return { outcome, confidence, reasoning, scenarios };
}

function normalizeNewsImpact(
  raw: unknown
): AnalysisResult["newsImpact"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((n) => {
      if (!n || typeof n !== "object") return null;
      const o = n as Record<string, unknown>;
      const headline = typeof o.headline === "string" ? o.headline : "";
      const impact = typeof o.impact === "string" ? o.impact : "";
      const team = typeof o.team === "string" ? o.team : "";
      if (!headline && !impact && !team) return null;
      const body = typeof o.body === "string" ? o.body : undefined;
      let sources: { label?: string; url: string }[] | undefined;
      if (Array.isArray(o.sources)) {
        sources = o.sources
          .filter((s): s is { label?: string; url: string } => {
            if (!s || typeof s !== "object") return false;
            const u = (s as { url?: unknown }).url;
            return typeof u === "string" && /^https?:\/\//i.test(u.trim());
          })
          .map((s) => ({
            label:
              typeof (s as { label?: unknown }).label === "string"
                ? (s as { label: string }).label
                : undefined,
            url: (s as { url: string }).url.trim(),
          }));
        if (sources.length === 0) sources = undefined;
      }
      return { headline, impact, team, body, sources };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
