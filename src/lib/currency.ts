import type { AppLocaleCode } from "@/lib/locale";

/**
 * Канонические цены в `renewal-packages` — в RUB.
 * Курсы ниже только для отображения в UI (не для биллинга Stripe).
 */
const RUB_PER_USD = 91;
const RUB_PER_CNY = 12.5;
const VND_PER_RUB = 300;
const KRW_PER_RUB = 15;

type CurrencyCode = "RUB" | "USD" | "VND" | "CNY" | "KRW";

type CurrencyConfig = {
  currency: CurrencyCode;
  intlLocale: string;
  fractionDigits: number;
  perMonthSuffix: string;
};

const CURRENCY_BY_LOCALE: Record<AppLocaleCode, CurrencyConfig> = {
  ru: {
    currency: "RUB",
    intlLocale: "ru-RU",
    fractionDigits: 0,
    perMonthSuffix: "/мес",
  },
  en: {
    currency: "USD",
    intlLocale: "en-US",
    fractionDigits: 2,
    perMonthSuffix: "/mo",
  },
  vi: {
    currency: "VND",
    intlLocale: "vi-VN",
    fractionDigits: 0,
    perMonthSuffix: "/tháng",
  },
  zh: {
    currency: "CNY",
    intlLocale: "zh-CN",
    fractionDigits: 0,
    perMonthSuffix: "/月",
  },
  ko: {
    currency: "KRW",
    intlLocale: "ko-KR",
    fractionDigits: 0,
    perMonthSuffix: "/월",
  },
};

function roundDisplayAmount(amount: number, locale: AppLocaleCode): number {
  if (locale === "en") {
    return Math.round(amount * 100) / 100;
  }
  if (locale === "vi") {
    return Math.round(amount / 1_000) * 1_000;
  }
  if (locale === "ko") {
    return Math.round(amount / 100) * 100;
  }
  return Math.round(amount);
}

/** Сумма в RUB → число в валюте локали (для отображения). */
export function convertRubToDisplay(rub: number, locale: AppLocaleCode): number {
  let amount: number;
  switch (locale) {
    case "ru":
      amount = rub;
      break;
    case "en":
      amount = rub / RUB_PER_USD;
      break;
    case "vi":
      amount = rub * VND_PER_RUB;
      break;
    case "zh":
      amount = rub / RUB_PER_CNY;
      break;
    case "ko":
      amount = rub * KRW_PER_RUB;
      break;
    default:
      amount = rub;
  }
  return roundDisplayAmount(amount, locale);
}

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: AppLocaleCode): Intl.NumberFormat {
  const cfg = CURRENCY_BY_LOCALE[locale];
  const key = `${cfg.intlLocale}:${cfg.currency}:${cfg.fractionDigits}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(cfg.intlLocale, {
      style: "currency",
      currency: cfg.currency,
      minimumFractionDigits: cfg.fractionDigits,
      maximumFractionDigits: cfg.fractionDigits,
    });
    formatters.set(key, fmt);
  }
  return fmt;
}

export function formatPriceFromRub(
  rub: number,
  locale: AppLocaleCode
): string {
  const amount = convertRubToDisplay(rub, locale);
  return getFormatter(locale).format(amount);
}

export function formatMonthlyPriceFromRub(
  totalRub: number,
  months: number,
  locale: AppLocaleCode
): string {
  const monthlyRub =
    months < 1 ? totalRub : Math.round(totalRub / months);
  return `${formatPriceFromRub(monthlyRub, locale)}${CURRENCY_BY_LOCALE[locale].perMonthSuffix}`;
}

export function currencyCodeForLocale(locale: AppLocaleCode): CurrencyCode {
  return CURRENCY_BY_LOCALE[locale].currency;
}

/** Подсказка при оплате: Stripe списывает в RUB. */
export function stripeChargeDisclaimer(locale: AppLocaleCode): string | null {
  if (locale === "ru") return null;
  const map: Record<Exclude<AppLocaleCode, "ru">, string> = {
    en: "Charged in RUB via Stripe. Displayed prices are approximate.",
    vi: "Thanh toán bằng RUB qua Stripe. Giá hiển thị chỉ mang tính tham khảo.",
    zh: "通过 Stripe 以卢布 (RUB) 扣款。显示金额为参考价。",
    ko: "Stripe에서 RUB로 결제됩니다. 표시 금액은 참고용입니다.",
  };
  return map[locale];
}
