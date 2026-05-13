export type SubscriptionFeatureRow = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
};

/** Строки таблицы сравнения Free / Pro на странице подписки. */
export const SUBSCRIPTION_FEATURE_ROWS: SubscriptionFeatureRow[] = [
  { label: "Анализы предстоящих матчей", free: "1 в день", pro: "Без лимита" },
  { label: "Анализы Live", free: "1 в день", pro: "Без лимита" },
  { label: "Краткое ИИ‑резюме", free: true, pro: true },
  { label: "Развёрнутая аргументация", free: false, pro: true },
  { label: "Ключевые факторы матча", free: false, pro: true },
  { label: "Статистика прогнозов", free: "30 дней", pro: "90 дней" },
];

/** Маркетинговый список преимуществ Pro (как колонка Pro на странице подписки). */
export const PRO_MARKETING_BULLETS: string[] = SUBSCRIPTION_FEATURE_ROWS.map(
  (row) =>
    typeof row.pro === "string" ? `${row.label} — ${row.pro}` : row.label
);
