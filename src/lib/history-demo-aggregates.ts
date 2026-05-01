/** Пример агрегатов истории для UI / скриншотов (число матчей и угадываний). */
export const HISTORY_UI_DEMO_AGGREGATES = {
  /** correct ≈ 85%; «Сегодня» 20/24 (~83%). Суммы по вложенным периодам. */
  today: { total: 24, correct: 20 },
  week: { total: 480, correct: 408 },
  month: { total: 1802, correct: 1532 },
  threeMonths: { total: 5200, correct: 4420 },
} as const;
