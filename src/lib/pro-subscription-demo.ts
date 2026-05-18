/** Демо-данные активной подписки Pro (до появления API). */

export type ProSubscriptionHistoryStatus = "current" | "completed" | "canceled";

export interface ProSubscriptionHistoryRow {
  id: string;
  /** Для сортировки: начало оплаченного периода */
  periodStartISO: string;
  periodEndISO: string;
  amountRub: number;
  status: ProSubscriptionHistoryStatus;
}

export const PRO_SUBSCRIPTION_DEMO = {
  /** Начало текущего оплаченного периода */
  currentPeriodStartISO: "2026-04-21T12:00:00.000+03:00",
  /** Конец текущего оплаченного периода */
  currentPeriodEndISO: "2026-05-21T21:00:00.000+03:00",
  /** Ориентир стоимости при следующей оплате месяца (без автопродления) */
  nextChargeRub: 499,
  /** Последние периоды (на экране: новые сверху, максимум 5) */
  history: [
    {
      id: "1",
      periodStartISO: "2025-12-15T12:00:00.000+03:00",
      periodEndISO: "2026-01-15T12:00:00.000+03:00",
      amountRub: 499,
      status: "completed" as const,
    },
    {
      id: "2",
      periodStartISO: "2026-01-15T12:00:00.000+03:00",
      periodEndISO: "2026-02-15T12:00:00.000+03:00",
      amountRub: 499,
      status: "completed" as const,
    },
    {
      id: "3",
      periodStartISO: "2026-02-15T12:00:00.000+03:00",
      periodEndISO: "2026-03-15T12:00:00.000+03:00",
      amountRub: 499,
      status: "completed" as const,
    },
    {
      id: "4",
      periodStartISO: "2026-03-15T12:00:00.000+03:00",
      periodEndISO: "2026-04-15T12:00:00.000+03:00",
      amountRub: 499,
      status: "completed" as const,
    },
    {
      id: "5",
      periodStartISO: "2026-04-21T12:00:00.000+03:00",
      periodEndISO: "2026-05-21T21:00:00.000+03:00",
      amountRub: 499,
      status: "current" as const,
    },
  ] as ProSubscriptionHistoryRow[],
};
