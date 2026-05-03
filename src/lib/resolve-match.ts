import { getMockMatchById } from "@/lib/mock-data";
import { rawMatchToMatch } from "@/lib/match-mapper";
import { getMatchById } from "@/lib/sports-api";
import type { Match } from "@/types/match";

function useMocksData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.API_SPORTS_KEY
  );
}

/** Загрузка матча для страницы анализа: моки или fixture API-Football по числовому id. */
export async function resolveMatch(id: string): Promise<Match | null> {
  if (useMocksData()) {
    return getMockMatchById(id) ?? null;
  }

  if (/^\d+$/.test(id)) {
    const raw = await getMatchById(parseInt(id, 10));
    if (raw) return rawMatchToMatch(raw);
  }

  return getMockMatchById(id) ?? null;
}
