import type { AppLocaleCode } from "@/lib/locale";
import { en } from "@/i18n/messages/en";
import { ko } from "@/i18n/messages/ko";
import { ru } from "@/i18n/messages/ru";
import { vi } from "@/i18n/messages/vi";
import { zh } from "@/i18n/messages/zh";
import type { Messages, TranslateParams } from "@/i18n/types";

const CATALOG: Record<AppLocaleCode, Messages> = {
  ru,
  en,
  vi,
  zh,
  ko,
};

export function getMessages(locale: AppLocaleCode): Messages {
  return CATALOG[locale] ?? CATALOG.ru;
}

function getNestedValue(
  messages: Messages,
  key: string
): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export type TranslateFn = (
  key: string,
  params?: TranslateParams
) => string;

export function createTranslator(locale: AppLocaleCode): TranslateFn {
  const messages = getMessages(locale);
  const fallback = CATALOG.ru;

  return function t(key: string, params?: TranslateParams): string {
    let raw =
      getNestedValue(messages, key) ?? getNestedValue(fallback, key) ?? key;

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        raw = raw.replaceAll(`{${name}}`, String(value));
      }
    }
    return raw;
  };
}

export function formatPluralDays(locale: AppLocaleCode, count: number): string {
  const forms = getMessages(locale).plural.days;
  const rules = new Intl.PluralRules(locale);
  const rule = rules.select(count);
  const template =
    rule === "one"
      ? forms.one
      : rule === "few"
        ? forms.few
        : forms.many;
  return template.replace("{n}", String(count));
}

export function localeIntlTag(locale: AppLocaleCode): string {
  const map: Record<AppLocaleCode, string> = {
    ru: "ru-RU",
    en: "en-US",
    vi: "vi-VN",
    zh: "zh-CN",
    ko: "ko-KR",
  };
  return map[locale];
}
