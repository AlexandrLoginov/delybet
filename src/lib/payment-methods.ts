import type { AppLocaleCode } from "@/lib/locale";

export type PaymentMethodId = "stripe" | "payos";

export type PaymentMethodDefinition = {
  id: PaymentMethodId;
  /** Порядок в списке (меньше — выше). */
  order: number;
  /** Показывать только для этих локалей; пусто = все. */
  locales?: AppLocaleCode[];
};

/** Канонический порядок и привязка к локалям (доступность — с API). */
const PAYMENT_METHOD_DEFINITIONS: PaymentMethodDefinition[] = [
  {
    id: "payos",
    order: 0,
    locales: ["vi"],
  },
  {
    id: "stripe",
    order: 10,
  },
];

export function paymentMethodsForLocale(locale: AppLocaleCode): PaymentMethodId[] {
  return PAYMENT_METHOD_DEFINITIONS.filter(
    (m) => !m.locales || m.locales.includes(locale)
  )
    .sort((a, b) => a.order - b.order)
    .map((m) => m.id);
}

export function shouldShowPaymentMethodStep(
  locale: AppLocaleCode,
  availableIds: PaymentMethodId[]
): boolean {
  const forLocale = paymentMethodsForLocale(locale).filter((id) =>
    availableIds.includes(id)
  );
  if (forLocale.length === 0) return false;
  /** Для нерусской локали всегда показываем шаг (цена в местной валюте). */
  if (locale !== "ru") return true;
  return forLocale.length > 1;
}
