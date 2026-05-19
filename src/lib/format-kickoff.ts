import type { TranslateFn } from "@/i18n";
import { localeIntlTag } from "@/i18n";
import type { AppLocaleCode } from "@/lib/locale";

export function formatKickoff(
  iso: string,
  locale: AppLocaleCode,
  t: TranslateFn
): { day: string; time: string } {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(localeIntlTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  let day = date.toLocaleDateString(localeIntlTag(locale), {
    day: "numeric",
    month: "short",
  });
  if (isSameDay(date, today)) day = t("common.today");
  else if (isSameDay(date, tomorrow)) day = t("common.tomorrow");

  return { day, time };
}

export function formatTimeUntil(iso: string, t: TranslateFn): string | null {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;

  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return t("matches.inMinutes", { minutes });

  const hours = Math.round(minutes / 60);
  if (hours < 24) return t("matches.inHours", { hours });

  const days = Math.round(hours / 24);
  return t("matches.inDays", { days });
}
