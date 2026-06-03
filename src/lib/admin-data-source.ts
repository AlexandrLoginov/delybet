import type { NextRequest } from "next/server";

import { forceMockData, isLiveAnalysisEnabled, isLiveSportsDataEnabled } from "@/lib/integrations-config";
import { getAdminTelegramUsernameFromRequest } from "@/lib/telegram/admin-from-request";
import { UI_PREVIEW_DATA_SOURCE_COOKIE } from "@/lib/ui-preview-data-source-cookie";

export type AdminDataSourceMode = "mock" | "api";

export function getAdminDataSourceFromCookieValue(
  value: string | undefined
): AdminDataSourceMode | null {
  if (value === "mock" || value === "api") return value;
  return null;
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

/**
 * Режим mock|api: httpOnly-кука (ставится только админским POST) или query + initData/сессия.
 */
export function getAdminDataSourceOverrideFromRequest(
  req: NextRequest
): AdminDataSourceMode | null {
  const cookieMode = getAdminDataSourceFromCookieValue(
    req.cookies.get(UI_PREVIEW_DATA_SOURCE_COOKIE)?.value
  );
  if (cookieMode) return cookieMode;

  const qp = req.nextUrl.searchParams.get("dataSource");
  if (qp !== "mock" && qp !== "api") return null;
  if (!getAdminTelegramUsernameFromRequest(req)) return null;
  return qp;
}

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

/** Для RSC: кука выставлена только после проверки админа. */
export function getAdminDataSourceOverrideFromCookies(
  cookieStore: CookieReader
): AdminDataSourceMode | null {
  return getAdminDataSourceFromCookieValue(
    cookieStore.get(UI_PREVIEW_DATA_SOURCE_COOKIE)?.value
  );
}
