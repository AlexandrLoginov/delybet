// src/lib/ai-analysis.ts
// Полная цепочка: сбор данных → промпт → Claude → парсинг → кэш

import Anthropic from "@anthropic-ai/sdk";
import { getMatchById, getMatchStats, getTeamForm, getMatchNews } from "./sports-api";
import { getCached, setCached } from "./cache";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  };

  summary: string; // краткая версия для Free-пользователей

  // Pro-only поля:
  detailedAnalysis: string;
  keyFactors: { factor: string; impact: "POSITIVE_HOME" | "POSITIVE_AWAY" | "NEUTRAL" }[];
  newsImpact: { headline: string; impact: string; team: string }[];
}

// ── Главная функция ───────────────────────────────────────────────────────────

export async function analyzeMatch(
  matchId: string,
  sport: string = "football",
  isPro: boolean = false
): Promise<AnalysisResult> {
  const cacheKey = `analysis:${sport}:${matchId}`;

  // 1. Проверяем кэш
  const cached = await getCached<AnalysisResult>(cacheKey);
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

  const [homeForm, awayForm, news] = await Promise.all([
    getTeamForm(match.teams.home.id, match.league.id, 2024),
    getTeamForm(match.teams.away.id, match.league.id, 2024),
    getMatchNews(match.teams.home.name, match.teams.away.name),
  ]);

  // 3. Строим промпт
  const prompt = buildPrompt({ match, stats, homeForm, awayForm, news, isLive });

  // 4. Запрос к Claude
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `Ты — эксперт по спортивной аналитике. Анализируй матчи объективно на основе данных.
Всегда отвечай строго в JSON-формате без markdown-блоков и лишнего текста.`,
    messages: [{ role: "user", content: prompt }],
  });

  // 5. Парсим ответ
  const raw = (message.content[0] as { text: string }).text;
  const analysis = parseClaudeResponse(raw, matchId, isLive);

  // 6. Кэшируем (2 мин для Live, 15 мин для предстоящих)
  const ttlSeconds = isLive ? 120 : 900;
  await setCached(cacheKey, analysis, ttlSeconds);

  return analysis;
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
    "outcome": "<победа хозяев / ничья / победа гостей>",
    "confidence": "<HIGH | MEDIUM | LOW>",
    "reasoning": "<1-2 предложения — ключевая причина>"
  },
  "summary": "<краткий вывод, 1 предложение>",
  "detailedAnalysis": "<развёрнутый анализ, 3-4 предложения>",
  "keyFactors": [
    { "factor": "<фактор>", "impact": "<POSITIVE_HOME | POSITIVE_AWAY | NEUTRAL>" }
  ],
  "newsImpact": [
    { "headline": "<заголовок новости>", "impact": "<влияние>", "team": "<команда>" }
  ]
}`;
}

// ── Парсер ответа Claude ──────────────────────────────────────────────────────

function parseClaudeResponse(raw: string, matchId: string, isLive: boolean): AnalysisResult {
  let parsed: any;

  try {
    // Убираем возможные markdown-блоки если Claude всё же добавил
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback если Claude вернул некорректный JSON
    parsed = {
      probabilities: { home: 45, draw: 25, away: 30 },
      recommendation: { outcome: "Нет данных", confidence: "LOW", reasoning: "Не удалось разобрать ответ" },
      summary: "Анализ временно недоступен",
      detailedAnalysis: "",
      keyFactors: [],
      newsImpact: [],
    };
  }

  const ttlMinutes = isLive ? 2 : 15;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  return {
    matchId,
    generatedAt: new Date().toISOString(),
    expiresAt,
    isLive,
    probabilities: parsed.probabilities,
    recommendation: parsed.recommendation,
    summary: parsed.summary,
    detailedAnalysis: parsed.detailedAnalysis,
    keyFactors: parsed.keyFactors ?? [],
    newsImpact: parsed.newsImpact ?? [],
  };
}
