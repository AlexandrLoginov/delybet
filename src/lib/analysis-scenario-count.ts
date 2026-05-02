import type { SportSlug } from "@/types/match";

/** Согласовано с mockRecommendationScenarios и ожидаемым ответом модели по рынкам. */
export function scenariosAnalyzedCountForSport(sport: SportSlug): number {
  switch (sport) {
    case "football":
      return 7;
    case "basketball":
      return 5;
    case "tennis":
      return 4;
    case "volleyball":
      return 4;
    default:
      return 6;
  }
}
