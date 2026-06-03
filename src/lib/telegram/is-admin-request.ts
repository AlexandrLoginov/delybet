import type { NextRequest } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { verifyAdminInitData } from "@/lib/telegram/verify-admin-init-data";

/** Админ: сессия с @username из списка или подписанный initData Mini App. */
export function isAdminRequest(
  sessionTg: string | undefined,
  initData: string | undefined
): boolean {
  if (isProfileAdminTelegramUsername(sessionTg)) return true;
  if (initData?.trim() && verifyAdminInitData(initData)) return true;
  return false;
}

export function isAdminHttpRequest(req: NextRequest): boolean {
  const session = getSessionPayloadFromRequest(req);
  const headerInit = req.headers.get("x-telegram-init-data")?.trim();
  return isAdminRequest(session?.tg, headerInit);
}
