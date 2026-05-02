import type { TelegramWebAppUser } from "@/types/telegram";

/** Без Node.js-зависимостей — безопасно для клиентских компонентов. */

export function displayNameFromTelegramUser(u: TelegramWebAppUser): string {
  const parts = [u.first_name, u.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (u.username) return `@${u.username}`;
  return `ID ${u.id}`;
}

export function initialsFromTelegramUser(u: TelegramWebAppUser): string {
  const a = u.first_name?.[0] ?? "";
  const b = u.last_name?.[0] ?? "";
  if (a && b) return (a + b).toLocaleUpperCase("ru-RU");
  if (a) return a.slice(0, 2).toLocaleUpperCase("ru-RU");
  if (u.username) return u.username.slice(0, 2).toUpperCase();
  return String(u.id).slice(-2);
}
