import type {
  AnalysisRecommendation,
  AnalysisRecommendationScenario,
  FormEntry,
  FullAnalysis,
  KeyFactor,
  MatchStatsView,
  NewsImpact,
} from "@/types/analysis";
import type { Match } from "@/types/match";

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function recommendationIsEmpty(rec: AnalysisRecommendation): boolean {
  if (rec.scenarios && rec.scenarios.length > 0) {
    return rec.scenarios.every((s) => !String(s.pick ?? "").trim());
  }
  return !rec.outcome?.trim();
}

function buildDemoRecommendation(
  match: Match,
  probs: FullAnalysis["probabilities"],
  base: AnalysisRecommendation
): AnalysisRecommendation {
  const homeN = match.home.shortName;
  const awayN = match.away.shortName;
  const h = Math.round(Number(probs.home) || 38);
  const d = probs.draw != null ? Math.round(Number(probs.draw)) : null;
  const a = Math.round(Number(probs.away) || 32);

  let mainPick: string;
  if (d != null) {
    const max = Math.max(h, d, a);
    if (max === h) mainPick = `Победа ${homeN}`;
    else if (max === a) mainPick = `Победа ${awayN}`;
    else mainPick = "Ничья";
  } else {
    mainPick = h >= a ? `Победа ${homeN}` : `Победа ${awayN}`;
  }

  const scenarios: AnalysisRecommendationScenario[] = [
    {
      kind: "MATCH_RESULT",
      label: "Исход",
      pick: mainPick,
      probability: d != null ? Math.max(h, d, a) : Math.max(h, a),
      reasoning:
        "Оценка по форме, составам и мотивации — демонстрационный сценарий для превью.",
    },
    {
      kind: "TOTAL",
      label: "Тотал 2.5",
      pick: "Больше 2.5",
      probability: 56,
      reasoning: "Ожидается открытая игра при текущем стиле команд.",
    },
    {
      kind: "BTTS",
      label: "Обе забьют",
      pick: "Да",
      probability: 51,
      reasoning: "Обе линии атаки стабильно забивают в последних турах.",
    },
    {
      kind: "DOUBLE_CHANCE",
      label: "Двойной шанс",
      pick: `1X (${homeN})`,
      probability: 68,
      reasoning: "Страховка от поражения хозяев поля.",
    },
  ];

  return {
    ...base,
    outcome: mainPick,
    scenarios,
    reasoning:
      base.reasoning?.trim() ||
      `Сводка: ${match.home.name} и ${match.away.name} — демо-обзор для экрана матча; полные выводы модели в подписке Pro.`,
  };
}

function buildDemoKeyFactors(match: Match): KeyFactor[] {
  return [
    {
      factor: `Домашний фактор и поддержка арены для ${match.home.name}.`,
      impact: "POSITIVE_HOME",
    },
    {
      factor: `${match.away.name} — высокий прессинг и быстрые переходы в атаку.`,
      impact: "POSITIVE_AWAY",
    },
    {
      factor: "Плотный календарь: ротация составов может повлиять на свежесть.",
      impact: "NEUTRAL",
    },
    {
      factor: "Индивидуальные дуэли на флангах могут стать ключом к голевым моментам.",
      impact: "NEUTRAL",
    },
  ];
}

function buildDemoDetailed(match: Match): string {
  return [
    `${match.home.name} выступает дома и обычно набирает больше ожидаемых xG в родных стенах.`,
    `${match.away.name} уверенно действует в переходах и может наказать за ошибки в обороне.`,
    "Тонкость матча — в стандартах и реализации моментов в штрафной; исход может решить один эпизод.",
    "Ниже — демонстрационный текст для превью интерфейса; в Pro доступны полные сценарии и обновления модели.",
  ].join(" ");
}

function buildDemoStats(match: Match): MatchStatsView[] {
  const x = hashId(match.id);
  const poss = 48 + (x % 12);
  return [
    {
      label: "Владение (оценка)",
      home: poss,
      away: 100 - poss,
      unit: "%",
    },
    {
      label: "Удары (ожид.)",
      home: 12 + (x % 6),
      away: 10 + ((x >> 2) % 5),
    },
    {
      label: "Опасные моменты",
      home: 2 + (x % 3),
      away: 2 + ((x >> 4) % 3),
    },
  ];
}

function buildDemoForm(teamLabel: string): FormEntry[] {
  const seq: FormEntry["result"][] = ["W", "W", "D", "L", "W"];
  return seq.map((result, i) => ({
    result,
    opponent: `${teamLabel} · соперник ${i + 1}`,
    score: "—",
  }));
}

function buildDemoNews(match: Match): NewsImpact[] {
  const home = match.home.shortName;
  const away = match.away.shortName;
  return [
    {
      headline: `Состав ${home}: без кадровых потерь перед матчем`,
      body: [
        `Штаб ${match.home.name} опубликовал заявку без дисквалификаций и травм в ключевых зонах. Основные полузащитники и форварды работали в общей группе на заключительной тренировке, без ограничений по контактной нагрузке.`,
        `По данным клубного трекера, объём высокоинтенсивных отрезков накануне матча был снижен — акцент на восстановлении и тактических установках. Вратарская линия тоже в полном составе: нет переносов из лазарета и внеплановых замен в заявке.`,
        `Для соперника это означает меньше сюрпризов в стартовом составе и более предсказуемую схему прессинга в первых минутах. Тренерский штаб сможет выставить привычные связки в середине поля и на флангах без форсированной ротации.`,
      ].join("\n\n"),
      impact:
        "Стабильный состав повышает предсказуемость схемы и снижает риск вынужденных перестроений в разминке.",
      team: match.home.name,
    },
    {
      headline: `${away} усилил прессинг в последних турах`,
      body: [
        `В последних трёх турах ${match.away.name} набирает больше отборов в средней трети и чаще форсирует высокий прессинг после потерь соперника. Тренер отмечал работу «десятки» и пары опорников как основу этого рывка.`,
        `Статистика по PPDA (передачам соперника до отборительного действия) улучшилась: команда даёт меньше времени на выход из обороны. Это может сказаться на длинных передачах хозяев, если те попытаются разрядить прессинг через центр.`,
        `При этом гости сохраняют уязвимость на вторых этажах после стандарта — баланс между агрессией впереди и компактностью линий ещё не идеален. Исход первого тайма может зависеть от того, удастся ли хозяевам быстро выйти из-под прессинга на своей половине.`,
      ].join("\n\n"),
      impact:
        "Ранний высокий прессинг гостей может укоротить контроль мяча у хозяев в первом отрезке и спровоцировать ошибки при выводе.",
      team: match.away.name,
    },
  ];
}

/** Дополняет пустые поля анализа демо-контентом (список матчей и Free-режим). */
export function fillAnalysisDemoGaps(
  match: Match,
  analysis: FullAnalysis
): FullAnalysis {
  let recommendation = analysis.recommendation;
  if (recommendationIsEmpty(recommendation)) {
    recommendation = buildDemoRecommendation(
      match,
      analysis.probabilities,
      recommendation
    );
  }

  const keyFactors = analysis.keyFactors.length
    ? analysis.keyFactors
    : buildDemoKeyFactors(match);

  const detailedAnalysis = analysis.detailedAnalysis.trim()
    ? analysis.detailedAnalysis
    : buildDemoDetailed(match);

  const stats = analysis.stats.length
    ? analysis.stats
    : buildDemoStats(match);

  const homeForm = analysis.homeForm.length
    ? analysis.homeForm
    : buildDemoForm(match.home.shortName);

  const awayForm = analysis.awayForm.length
    ? analysis.awayForm
    : buildDemoForm(match.away.shortName);

  const newsImpact = analysis.newsImpact.length
    ? analysis.newsImpact
    : buildDemoNews(match);

  return {
    ...analysis,
    recommendation,
    keyFactors,
    detailedAnalysis,
    stats,
    homeForm,
    awayForm,
    newsImpact,
  };
}
