export type SportSlug = "football" | "basketball" | "tennis" | "volleyball";

export type FormResult = "W" | "D" | "L";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  logoColor: string;
  logoUrl: string;
}

export interface AiPick {
  side: "HOME" | "DRAW" | "AWAY";
  outcome: string;
  probability: number;
  probabilities: { home: number; draw: number | null; away: number };
  confidence: Confidence;
}

export interface LiveStats {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
}

export interface Match {
  id: string;
  sport: SportSlug;
  league: string;
  country: string;
  round: string;
  venue?: string;
  kickoffISO: string;
  status: "upcoming" | "live" | "finished";
  elapsedMinutes?: number;
  home: Team;
  away: Team;
  scoreHome?: number;
  scoreAway?: number;
  lastFiveHome?: FormResult[];
  lastFiveAway?: FormResult[];
  aiPick?: AiPick;
  liveStats?: LiveStats;
}

export interface HistoryMatch extends Match {
  status: "finished";
  scoreHome: number;
  scoreAway: number;
  finishedISO: string;
  prediction: {
    probHome: number;
    probDraw: number | null;
    probAway: number;
    outcome: string;
    confidence: Confidence;
    summary: string;
    reasoning: string;
  };
  actualOutcome: "HOME" | "DRAW" | "AWAY";
}
