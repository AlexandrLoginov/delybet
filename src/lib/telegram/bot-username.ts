import { getTelegramBotOpenUrl } from "@/lib/telegram/telegram-bot-url";

/** @username бота для Telegram Login Widget (без @). */
export function getTelegramBotUsername(): string {
  const explicit = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
  if (explicit) {
    return explicit.startsWith("@") ? explicit.slice(1) : explicit;
  }

  const url = getTelegramBotOpenUrl();
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (segment) return segment;
  } catch {
    /* fall through */
  }

  return "delybet_bot";
}
