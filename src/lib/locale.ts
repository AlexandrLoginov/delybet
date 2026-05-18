/** Языки интерфейса (код BCP 47 → подпись и ISO-код страны для флага). */

export const APP_LOCALES = [
  { code: "ru", label: "Русский", flagCountry: "ru" },
  { code: "en", label: "Английский", flagCountry: "gb" },
  { code: "vi", label: "Вьетнамский", flagCountry: "vn" },
  { code: "zh", label: "Китайский", flagCountry: "cn" },
  { code: "ko", label: "Корейский", flagCountry: "kr" },
] as const;

export type AppLocaleCode = (typeof APP_LOCALES)[number]["code"];

export const LOCALE_STORAGE_KEY = "sportai-locale";

export function isAppLocaleCode(value: string): value is AppLocaleCode {
  return APP_LOCALES.some((l) => l.code === value);
}

export function localeMeta(code: AppLocaleCode) {
  return APP_LOCALES.find((l) => l.code === code) ?? APP_LOCALES[0];
}

export function applyAppLocale(code: AppLocaleCode): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
  }
}

export function readStoredLocale(): AppLocaleCode | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isAppLocaleCode(stored) ? stored : null;
}

export function flagCdnUrl(countryCode: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${countryCode}.png`;
}
