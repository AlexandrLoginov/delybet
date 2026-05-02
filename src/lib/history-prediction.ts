import type { HistoryMatch } from "@/types/match";

/** Интерпретация текстового прогноза как исхода 1 / X / 2 (как в карточках истории). */
export function inferPredictedOutcome(match: HistoryMatch): "HOME" | "DRAW" | "AWAY" {
  const predictedHomeWin = match.prediction.outcome
    .toLowerCase()
    .includes(match.home.name.toLowerCase());
  const predictedDraw = /ничь/i.test(match.prediction.outcome);
  if (predictedHomeWin) return "HOME";
  if (predictedDraw) return "DRAW";
  return "AWAY";
}
