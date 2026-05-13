import { cn } from "@/lib/utils";
import type { AiPick, Confidence, Match } from "@/types/match";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockProbabilities(
  match: Match
): { home: number; draw: number | null; away: number } {
  const h = hashString(`${match.id}:${match.home.id}:${match.away.id}`);
  const hasDraw = match.sport === "football" || match.sport === "volleyball";
  if (hasDraw) {
    const home = 32 + (h % 28);
    const draw = 18 + ((h >> 3) % 18);
    const away = Math.max(18, 100 - home - draw);
    const sum = home + draw + away;
    return {
      home: Math.round((home / sum) * 100),
      draw: Math.round((draw / sum) * 100),
      away: Math.round((away / sum) * 100),
    };
  }
  const home = 38 + (h % 34);
  return { home, draw: null, away: 100 - home };
}

function mockHeadline(match: Match): string {
  const h = hashString(match.id);
  const lines = [
    `Небольшое преимущество у ${match.home.shortName} по форме и дому.`,
    `Игра на контроле мяча; ${match.away.shortName} опасен на контрвыпадах.`,
    `Высокая плотность в центре; исход может решить стандарт.`,
  ];
  return lines[h % lines.length] ?? lines[0];
}

function mockConfidence(h: number): Confidence {
  return (["MEDIUM", "HIGH", "LOW"] as const)[h % 3];
}

function confidenceLabel(c: Confidence): string {
  switch (c) {
    case "HIGH":
      return "Высокая";
    case "MEDIUM":
      return "Средняя";
    case "LOW":
      return "Низкая";
    default:
      return c;
  }
}

function snippetFromPick(pick: AiPick, match: Match) {
  const { home, draw, away } = pick.probabilities;
  return {
    home,
    draw,
    away,
    headline: pick.outcome,
    confidence: pick.confidence,
    homeLabel: match.home.shortName,
    awayLabel: match.away.shortName,
  };
}

function snippetMock(match: Match) {
  const probs = mockProbabilities(match);
  return {
    ...probs,
    headline: mockHeadline(match),
    confidence: mockConfidence(hashString(match.id)),
    homeLabel: match.home.shortName,
    awayLabel: match.away.shortName,
  };
}

function segmentTone(key: string): string {
  return cn(
    "h-full min-w-[6px] rounded-full",
    key === "h" && "bg-success",
    key === "d" && "bg-muted-foreground/45",
    key === "a" && "bg-destructive"
  );
}

export function MatchCardAnalysisSnippet({ match }: { match: Match }) {
  const data = match.aiPick
    ? snippetFromPick(match.aiPick, match)
    : snippetMock(match);
  const { home, draw, away, headline, confidence, homeLabel, awayLabel } = data;

  const parts: { key: string; pct: number; label: string }[] = [
    { key: "h", pct: home, label: homeLabel },
  ];
  if (draw != null) {
    parts.push({ key: "d", pct: draw, label: "Ничья" });
  }
  parts.push({ key: "a", pct: away, label: awayLabel });

  return (
    <div className="mt-3 rounded-[10px] border border-border bg-surface/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Прогноз ИИ
        </span>
        <span className="rounded-md border border-border bg-card px-1.5 py-px text-[10px] font-medium text-muted-foreground">
          Уверенность: {confidenceLabel(confidence)}
        </span>
      </div>

      <div className="flex h-2 gap-px overflow-hidden rounded-full bg-muted">
        {parts.map((p) => (
          <div
            key={p.key}
            className={segmentTone(p.key)}
            style={{ flexGrow: Math.max(p.pct, 1), flexBasis: 0 }}
            title={`${p.label}: ~${p.pct}%`}
          />
        ))}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
        {parts.map((p) => (
          <span key={`${p.key}-cap`} className="tabular-nums">
            <span className="text-foreground/80">{p.label}</span>
            <span className="mx-0.5">·</span>~{p.pct}%
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs leading-snug text-foreground/85">{headline}</p>
    </div>
  );
}
