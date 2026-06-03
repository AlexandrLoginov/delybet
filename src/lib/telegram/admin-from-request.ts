import type { NextRequest } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import {
  isInitDataAuthFresh,
  parseUserFromInitData,
  verifyTelegramWebAppInitData,
} from "@/lib/telegram/validate-init-data";

const INIT_DATA_HEADER = "x-telegram-init-data";

/** Админский @username (без @), если сессия или подписанный initData подтверждают доступ. */
export function getAdminTelegramUsernameFromRequest(
  req: NextRequest
): string | null {
  const session = getSessionPayloadFromRequest(req);
  if (isProfileAdminTelegramUsername(session?.tg)) {
    return session!.tg!;
  }

  const initData = req.headers.get(INIT_DATA_HEADER)?.trim();
  if (!initData) return null;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) return null;
  if (!isInitDataAuthFresh(initData)) return null;
  if (!verifyTelegramWebAppInitData(initData, botToken)) return null;

  const user = parseUserFromInitData(initData);
  const username = user?.username?.trim().toLowerCase();
  if (!username || !isProfileAdminTelegramUsername(username)) return null;
  return username;
}

export function getTelegramInitDataHeaderName(): string {
  return INIT_DATA_HEADER;
}
