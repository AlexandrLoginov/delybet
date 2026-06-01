import { isLiveSportsDataEnabled } from "@/lib/integrations-config";
import { getMockMatchById } from "@/lib/mock-data";
import { rawMatchToMatch } from "@/lib/match-mapper";
import { getMatchById } from "@/lib/sports-api";
import type { Match } from "@/types/match";

/** Загрузка матча для страницы анализа: моки или fixture API-Football по числовому id. */
export async function resolveMatch(id: string): Promise<Match | null> {
  if (!isLiveSportsDataEnabled()) {
    return getMockMatchById(id) ?? null;
  }

  if (/^\d+$/.test(id)) {
    const raw = await getMatchById(parseInt(id, 10));
    if (raw) return rawMatchToMatch(raw);
  }

  return getMockMatchById(id) ?? null;
}
