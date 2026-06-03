import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import {
  isInitDataAuthFresh,
  parseUserFromInitData,
  verifyTelegramWebAppInitData,
} from "@/lib/telegram/validate-init-data";

/** Проверка initData Mini App для админских действий (без сессии в БД). */
export function verifyAdminInitData(initData: string): boolean {
  const trimmed = initData.trim();
  if (!trimmed) return false;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) return false;
  if (!isInitDataAuthFresh(trimmed)) return false;
  if (!verifyTelegramWebAppInitData(trimmed, botToken)) return false;

  const user = parseUserFromInitData(trimmed);
  return isProfileAdminTelegramUsername(user?.username);
}
