/**
 * Пакеты продления Pro. Базовая цена месяца — ориентир для скидок на длинные периоды.
 * Скидки: дольше период → ниже эквивалент за месяц (стимул на годовую оплату).
 */

export const RENEWAL_BASE_MONTHLY_RUB = 499;

export interface RenewalPackage {
  id: string;
  /** Короткий заголовок в списке */
  title: string;
  /** Подпись под заголовком */
  caption: string;
  months: number;
  /** Итого к оплате за весь период */
  totalRub: number;
  /** Скидка от суммы «базовый месяц × кол-во месяцев», % */
  discountPercent: number;
}

/**
 * Цены подобраны так, чтобы эквивалент за месяц снижался: 499 → ~440 → ~390 → ~333 ₽/мес.
 */
export const RENEWAL_PACKAGES: RenewalPackage[] = [
  {
    id: "1m",
    title: "1 месяц",
    caption: "Стандартная цена",
    months: 1,
    totalRub: 499,
    discountPercent: 0,
  },
  {
    id: "3m",
    title: "3 месяца",
    caption: "Выгодно для сезона",
    months: 3,
    totalRub: 1319,
    discountPercent: 12,
  },
  {
    id: "6m",
    title: "6 месяцев",
    caption: "Половина года без забот",
    months: 6,
    totalRub: 2339,
    discountPercent: 22,
  },
  {
    id: "12m",
    title: "12 месяцев",
    caption: "Максимальная экономия",
    months: 12,
    totalRub: 3999,
    discountPercent: 33,
  },
];

export function renewalFullPriceWithoutDiscount(months: number): number {
  return RENEWAL_BASE_MONTHLY_RUB * months;
}

export function renewalEquivalentMonthlyRub(totalRub: number, months: number): number {
  if (months < 1) return totalRub;
  return Math.round(totalRub / months);
}

/** Подписи пакетов из i18n; числа — из RENEWAL_PACKAGES. */
export function mergeRenewalPackageLabels(
  packages: RenewalPackage[],
  labels: Record<
    string,
    { title: string; caption: string } | undefined
  >
): RenewalPackage[] {
  return packages.map((p) => {
    const l = labels[p.id];
    if (!l) return p;
    return { ...p, title: l.title, caption: l.caption };
  });
}

export const mergeRenewalPackages = mergeRenewalPackageLabels;
