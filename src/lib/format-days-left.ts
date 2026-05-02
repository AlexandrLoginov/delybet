/** Оставшиеся полные дни до даты (локальное время). */

/** Сколько календарных дней от даты from до to (только даты, без времени). */
export function getCalendarDaysFromTo(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export function getWholeDaysUntil(end: Date, now: Date = new Date()): number {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfEndDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();
  return Math.round((startOfEndDay - startOfToday) / 86_400_000);
}

export function pluralRuDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return `${n} дней`;
  if (d === 1) return `${n} день`;
  if (d >= 2 && d <= 4) return `${n} дня`;
  return `${n} дней`;
}
