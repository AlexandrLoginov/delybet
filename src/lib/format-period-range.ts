import type { AppLocaleCode } from "@/lib/locale";
import { localeIntlTag } from "@/i18n";

/** Localized subscription period label, e.g. "Apr 21 — May 21, 2026". */
export function formatSubscriptionPeriodRange(
  locale: AppLocaleCode,
  startISO: string,
  endISO: string
): string {
  const tag = localeIntlTag(locale);
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameYear = start.getFullYear() === end.getFullYear();
  const monthDay: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const startLabel = start.toLocaleDateString(
    tag,
    sameYear ? monthDay : { ...monthDay, year: "numeric" }
  );
  const endLabel = end.toLocaleDateString(tag, {
    ...monthDay,
    year: "numeric",
  });
  return `${startLabel} — ${endLabel}`;
}
