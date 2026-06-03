import type { NextRequest } from "next/server";

import { forceMockData, isLiveAnalysisEnabled, isLiveSportsDataEnabled } from "@/lib/integrations-config";
import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { UI_PREVIEW_DATA_SOURCE_COOKIE } from "@/lib/ui-preview-data-source-cookie";

export type AdminDataSourceMode = "mock" | "api";

export function getAdminDataSourceFromCookieValue(
  value: string | undefined
): AdminDataSourceMode | null {
  if (value === "mock" || value === "api") return value;
  return null;
}

/** Переопределение источника данных только для админского Telegram @username. */
export function getAdminDataSourceOverride(
  telegramUsername: string | undefined,
  cookieValue: string | undefined
): AdminDataSourceMode | null {
  if (!isProfileAdminTelegramUsername(telegramUsername)) return null;
  return getAdminDataSourceFromCookieValue(cookieValue);
}

export function resolveUseMockSportsData(
  adminOverride: AdminDataSourceMode | null
): boolean {
  if (adminOverride === "mock") return true;
  if (adminOverride === "api") return false;
  return forceMockData() || !isLiveSportsDataEnabled();
}

export function resolveUseMockAnalysis(
  adminOverride: AdminDataSourceMode | null
): boolean {
  if (adminOverride === "mock") return true;
  if (adminOverride === "api") return false;
  return forceMockData() || !isLiveAnalysisEnabled();
}

export function getAdminDataSourceOverrideFromRequest(
  req: NextRequest
): AdminDataSourceMode | null {
  const session = getSessionPayloadFromRequest(req);
  const cookie = req.cookies.get(UI_PREVIEW_DATA_SOURCE_COOKIE)?.value;
  return getAdminDataSourceOverride(session?.tg, cookie);
}

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

export function getAdminDataSourceOverrideFromCookies(
  cookieStore: CookieReader,
  sessionTg?: string
): AdminDataSourceMode | null {
  const cookie = cookieStore.get(UI_PREVIEW_DATA_SOURCE_COOKIE)?.value;
  return getAdminDataSourceOverride(sessionTg, cookie);
}
