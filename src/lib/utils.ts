import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKickoff(iso: string): { day: string; time: string } {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("ru-RU", {
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

  let day = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
  if (isSameDay(date, today)) day = "Сегодня";
  else if (isSameDay(date, tomorrow)) day = "Завтра";

  return { day, time };
}

export function formatTimeUntil(iso: string): string | null {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;

  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `через ${minutes} мин`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `через ${hours} ч`;

  const days = Math.round(hours / 24);
  return `через ${days} дн`;
}
