import { cookies } from "next/headers";

import {
  getAdminDataSourceOverrideFromCookies,
  resolveUseMockSportsData,
} from "@/lib/admin-data-source";
import { SESSION_COOKIE, verifySessionPayload } from "@/lib/auth-session";
import { getMockMatchById } from "@/lib/mock-data";
import { rawMatchToMatch } from "@/lib/match-mapper";
import { getMatchById } from "@/lib/sports-api";
import type { Match } from "@/types/match";

/** Загрузка матча для страницы анализа: моки или fixture API-Football по числовому id. */
export async function resolveMatch(id: string): Promise<Match | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const session = sessionToken ? verifySessionPayload(sessionToken) : null;
  const adminOverride = getAdminDataSourceOverrideFromCookies(
    cookieStore,
    session?.tg
  );
  const useMock = resolveUseMockSportsData(adminOverride);

  if (useMock) {
    return getMockMatchById(id) ?? null;
  }

  if (/^\d+$/.test(id)) {
    const raw = await getMatchById(parseInt(id, 10));
    if (raw) return rawMatchToMatch(raw);
  }

  return getMockMatchById(id) ?? null;
}
