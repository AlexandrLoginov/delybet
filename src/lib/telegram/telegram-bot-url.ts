/** Публичная ссылка на бота; переопределяется через NEXT_PUBLIC_TELEGRAM_BOT_URL. */
export const TELEGRAM_BOT_DEFAULT = "https://t.me/delybet_bot";

export function getTelegramBotOpenUrl(): string {
  const raw = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return TELEGRAM_BOT_DEFAULT;
}
