import type {
  AiPick,
  Confidence,
  FormResult,
  HistoryMatch,
  Match,
  SportSlug,
  Team,
} from "@/types/match";
import type { FullAnalysis } from "@/types/analysis";

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const SPORTS: { slug: SportSlug; label: string; emoji: string }[] = [
  { slug: "football", label: "Футбол", emoji: "⚽" },
  { slug: "basketball", label: "Баскетбол", emoji: "🏀" },
  { slug: "tennis", label: "Теннис", emoji: "🎾" },
  { slug: "volleyball", label: "Волейбол", emoji: "🏐" },
];

const apiSportsLogo = (id: number) =>
  `https://media.api-sports.io/football/teams/${id}.png`;
const espnNbaLogo = (slug: string) =>
  `https://a.espncdn.com/i/teamlogos/nba/500/${slug}.png`;
const flag = (cc: string) => `https://flagcdn.com/w160/${cc}.png`;

const TEAMS: Record<string, Team> = {
  realMadrid: {
    id: 541, name: "Реал Мадрид", shortName: "RMA",
    logoColor: "#facc15", logoUrl: apiSportsLogo(541),
  },
  manCity: {
    id: 50, name: "Манчестер Сити", shortName: "MCI",
    logoColor: "#60a5fa", logoUrl: apiSportsLogo(50),
  },
  arsenal: {
    id: 42, name: "Арсенал", shortName: "ARS",
    logoColor: "#f87171", logoUrl: apiSportsLogo(42),
  },
  liverpool: {
    id: 40, name: "Ливерпуль", shortName: "LIV",
    logoColor: "#dc2626", logoUrl: apiSportsLogo(40),
  },
  barcelona: {
    id: 529, name: "Барселона", shortName: "BAR",
    logoColor: "#a78bfa", logoUrl: apiSportsLogo(529),
  },
  atletico: {
    id: 530, name: "Атлетико", shortName: "ATM",
    logoColor: "#f97316", logoUrl: apiSportsLogo(530),
  },
  bayern: {
    id: 157, name: "Бавария", shortName: "BAY",
    logoColor: "#dc2626", logoUrl: apiSportsLogo(157),
  },
  psg: {
    id: 85, name: "ПСЖ", shortName: "PSG",
    logoColor: "#1d4ed8", logoUrl: apiSportsLogo(85),
  },
  chelsea: {
    id: 49, name: "Челси", shortName: "CHE",
    logoColor: "#1d4ed8", logoUrl: apiSportsLogo(49),
  },
  inter: {
    id: 505, name: "Интер", shortName: "INT",
    logoColor: "#3b82f6", logoUrl: apiSportsLogo(505),
  },
  tottenham: {
    id: 47, name: "Тоттенхэм", shortName: "TOT",
    logoColor: "#1d4ed8", logoUrl: apiSportsLogo(47),
  },
  manUnited: {
    id: 33, name: "Манчестер Юнайтед", shortName: "MUN",
    logoColor: "#dc2626", logoUrl: apiSportsLogo(33),
  },
  juventus: {
    id: 496, name: "Ювентус", shortName: "JUV",
    logoColor: "#0f172a", logoUrl: apiSportsLogo(496),
  },
  milan: {
    id: 489, name: "Милан", shortName: "MIL",
    logoColor: "#dc2626", logoUrl: apiSportsLogo(489),
  },
  napoli: {
    id: 492, name: "Наполи", shortName: "NAP",
    logoColor: "#0ea5e9", logoUrl: apiSportsLogo(492),
  },
  dortmund: {
    id: 165, name: "Боруссия Д", shortName: "BVB",
    logoColor: "#facc15", logoUrl: apiSportsLogo(165),
  },
  roma: {
    id: 497, name: "Рома", shortName: "ROM",
    logoColor: "#fbbf24", logoUrl: apiSportsLogo(497),
  },
  lakers: {
    id: 1001, name: "Lakers", shortName: "LAL",
    logoColor: "#a855f7", logoUrl: espnNbaLogo("lal"),
  },
  celtics: {
    id: 1002, name: "Celtics", shortName: "BOS",
    logoColor: "#22c55e", logoUrl: espnNbaLogo("bos"),
  },
  warriors: {
    id: 1003, name: "Warriors", shortName: "GSW",
    logoColor: "#fbbf24", logoUrl: espnNbaLogo("gs"),
  },
  nuggets: {
    id: 1004, name: "Nuggets", shortName: "DEN",
    logoColor: "#3b82f6", logoUrl: espnNbaLogo("den"),
  },
  bucks: {
    id: 1005, name: "Bucks", shortName: "MIL",
    logoColor: "#15803d", logoUrl: espnNbaLogo("mil"),
  },
  suns: {
    id: 1006, name: "Suns", shortName: "PHX",
    logoColor: "#f97316", logoUrl: espnNbaLogo("phx"),
  },
  knicks: {
    id: 1007, name: "Knicks", shortName: "NYK",
    logoColor: "#2563eb", logoUrl: espnNbaLogo("ny"),
  },
  heat: {
    id: 1008, name: "Heat", shortName: "MIA",
    logoColor: "#ef4444", logoUrl: espnNbaLogo("mia"),
  },
  mavericks: {
    id: 1009, name: "Mavericks", shortName: "DAL",
    logoColor: "#3b82f6", logoUrl: espnNbaLogo("dal"),
  },
  sixers: {
    id: 1010, name: "76ers", shortName: "PHI",
    logoColor: "#1d4ed8", logoUrl: espnNbaLogo("phi"),
  },
  sinner: {
    id: 2001, name: "Янник Синнер", shortName: "SIN",
    logoColor: "#fbbf24", logoUrl: flag("it"),
  },
  alcaraz: {
    id: 2002, name: "Карлос Алькарас", shortName: "ALC",
    logoColor: "#f472b6", logoUrl: flag("es"),
  },
  djokovic: {
    id: 2003, name: "Новак Джокович", shortName: "DJO",
    logoColor: "#fbbf24", logoUrl: flag("rs"),
  },
  medvedev: {
    id: 2004, name: "Даниил Медведев", shortName: "MED",
    logoColor: "#94a3b8", logoUrl: flag("ru"),
  },
  rune: {
    id: 2005, name: "Хольгер Руне", shortName: "RUN",
    logoColor: "#dc2626", logoUrl: flag("dk"),
  },
  tsitsipas: {
    id: 2006, name: "Стефанос Циципас", shortName: "TSI",
    logoColor: "#1d4ed8", logoUrl: flag("gr"),
  },
  zverev: {
    id: 2007, name: "Александр Зверев", shortName: "ZVE",
    logoColor: "#facc15", logoUrl: flag("de"),
  },
  rublev: {
    id: 2008, name: "Андрей Рублёв", shortName: "RUB",
    logoColor: "#0ea5e9", logoUrl: flag("ru"),
  },
  fritz: {
    id: 2009, name: "Тейлор Фриц", shortName: "FRI",
    logoColor: "#3b82f6", logoUrl: flag("us"),
  },
  dimitrov: {
    id: 2010, name: "Григор Димитров", shortName: "DIM",
    logoColor: "#22c55e", logoUrl: flag("bg"),
  },
  poland: {
    id: 3001, name: "Польша", shortName: "POL",
    logoColor: "#ef4444", logoUrl: flag("pl"),
  },
  italy: {
    id: 3002, name: "Италия", shortName: "ITA",
    logoColor: "#3b82f6", logoUrl: flag("it"),
  },
  brazil: {
    id: 3003, name: "Бразилия", shortName: "BRA",
    logoColor: "#22c55e", logoUrl: flag("br"),
  },
  france: {
    id: 3004, name: "Франция", shortName: "FRA",
    logoColor: "#1d4ed8", logoUrl: flag("fr"),
  },
  usa: {
    id: 3005, name: "США", shortName: "USA",
    logoColor: "#1d4ed8", logoUrl: flag("us"),
  },
  argentina: {
    id: 3006, name: "Аргентина", shortName: "ARG",
    logoColor: "#38bdf8", logoUrl: flag("ar"),
  },
  slovenia: {
    id: 3007, name: "Словения", shortName: "SLO",
    logoColor: "#22c55e", logoUrl: flag("si"),
  },
  cuba: {
    id: 3008, name: "Куба", shortName: "CUB",
    logoColor: "#ef4444", logoUrl: flag("cu"),
  },
  japan: {
    id: 3009, name: "Япония", shortName: "JPN",
    logoColor: "#dc2626", logoUrl: flag("jp"),
  },
  serbia: {
    id: 3010, name: "Сербия", shortName: "SRB",
    logoColor: "#1d4ed8", logoUrl: flag("rs"),
  },
};

const aiHome = (
  outcome: string,
  probHome: number,
  probDraw: number | null,
  probAway: number,
  confidence: AiPick["confidence"]
): AiPick => ({
  side: "HOME",
  outcome,
  probability: probHome,
  probabilities: { home: probHome, draw: probDraw, away: probAway },
  confidence,
});

const aiAway = (
  outcome: string,
  probHome: number,
  probDraw: number | null,
  probAway: number,
  confidence: AiPick["confidence"]
): AiPick => ({
  side: "AWAY",
  outcome,
  probability: probAway,
  probabilities: { home: probHome, draw: probDraw, away: probAway },
  confidence,
});

export const MOCK_MATCHES: Match[] = [
  {
    id: "1001",
    sport: "football",
    league: "Лига чемпионов",
    country: "UEFA",
    round: "1/8 финала",
    venue: "Сантьяго Бернабеу",
    kickoffISO: inHours(3),
    status: "upcoming",
    home: TEAMS.realMadrid,
    away: TEAMS.manCity,
    lastFiveHome: ["W", "W", "D", "W", "W"],
    lastFiveAway: ["W", "L", "D", "W", "W"],
    aiPick: aiHome("Победа Реала", 54, 24, 22, "HIGH"),
  },
  {
    id: "1002",
    sport: "football",
    league: "АПЛ",
    country: "Англия",
    round: "32-й тур",
    venue: "Эмирейтс",
    kickoffISO: inHours(5),
    status: "upcoming",
    home: TEAMS.arsenal,
    away: TEAMS.liverpool,
    lastFiveHome: ["W", "W", "W", "D", "W"],
    lastFiveAway: ["L", "W", "W", "W", "D"],
    aiPick: aiHome("Победа Арсенала", 46, 28, 26, "MEDIUM"),
  },
  {
    id: "1003",
    sport: "football",
    league: "Ла Лига",
    country: "Испания",
    round: "30-й тур",
    venue: "Камп Ноу",
    kickoffISO: inHours(0.2),
    status: "live",
    elapsedMinutes: 67,
    home: TEAMS.barcelona,
    away: TEAMS.atletico,
    scoreHome: 2,
    scoreAway: 1,
    lastFiveHome: ["W", "D", "W", "W", "L"],
    lastFiveAway: ["W", "W", "L", "D", "W"],
    aiPick: aiHome("Барса добьёт", 62, 22, 16, "HIGH"),
    liveStats: {
      possessionHome: 58,
      possessionAway: 42,
      shotsHome: 14,
      shotsAway: 9,
    },
  },
  {
    id: "1004",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "Crypto.com Arena",
    kickoffISO: inHours(1),
    status: "live",
    elapsedMinutes: 24,
    home: TEAMS.lakers,
    away: TEAMS.celtics,
    scoreHome: 58,
    scoreAway: 61,
    lastFiveHome: ["W", "L", "W", "W", "L"],
    lastFiveAway: ["W", "W", "W", "L", "W"],
    aiPick: aiAway("Победа Бостона", 44, null, 56, "MEDIUM"),
    liveStats: {
      possessionHome: 49,
      possessionAway: 51,
      shotsHome: 51,
      shotsAway: 53,
    },
  },
  {
    id: "1005",
    sport: "tennis",
    league: "ATP Madrid",
    country: "Испания",
    round: "Полуфинал",
    venue: "Caja Mágica",
    kickoffISO: inHours(7),
    status: "upcoming",
    home: TEAMS.sinner,
    away: TEAMS.alcaraz,
    lastFiveHome: ["W", "W", "W", "L", "W"],
    lastFiveAway: ["W", "W", "L", "W", "W"],
    aiPick: aiAway("Победа Алькараса", 47, null, 53, "LOW"),
  },
  {
    id: "1006",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(26),
    status: "upcoming",
    home: TEAMS.poland,
    away: TEAMS.italy,
    lastFiveHome: ["W", "W", "L", "W", "W"],
    lastFiveAway: ["L", "W", "W", "L", "W"],
    aiPick: aiHome("Победа Польши", 55, null, 45, "MEDIUM"),
  },
  {
    id: "1007",
    sport: "football",
    league: "Бундеслига",
    country: "Германия",
    round: "29-й тур",
    venue: "Альянц Арена",
    kickoffISO: inHours(8),
    status: "upcoming",
    home: TEAMS.bayern,
    away: TEAMS.tottenham,
    lastFiveHome: ["W", "W", "W", "W", "L"],
    lastFiveAway: ["D", "W", "L", "W", "W"],
    aiPick: aiHome("Победа Баварии", 61, 22, 17, "HIGH"),
  },
  {
    id: "1008",
    sport: "football",
    league: "АПЛ",
    country: "Англия",
    round: "32-й тур",
    venue: "Олд Траффорд",
    kickoffISO: inHours(11),
    status: "upcoming",
    home: TEAMS.manUnited,
    away: TEAMS.chelsea,
    lastFiveHome: ["L", "W", "D", "L", "W"],
    lastFiveAway: ["D", "W", "W", "L", "W"],
    aiPick: aiAway("Победа Челси", 33, 28, 39, "LOW"),
  },
  {
    id: "1009",
    sport: "football",
    league: "Серия А",
    country: "Италия",
    round: "31-й тур",
    venue: "Альянц Стэдиум",
    kickoffISO: inHours(0.6),
    status: "live",
    elapsedMinutes: 38,
    home: TEAMS.juventus,
    away: TEAMS.inter,
    scoreHome: 0,
    scoreAway: 1,
    lastFiveHome: ["W", "W", "L", "W", "D"],
    lastFiveAway: ["W", "W", "W", "D", "W"],
    aiPick: aiAway("Победа Интера", 30, 24, 46, "MEDIUM"),
    liveStats: {
      possessionHome: 44,
      possessionAway: 56,
      shotsHome: 6,
      shotsAway: 11,
    },
  },
  {
    id: "1010",
    sport: "football",
    league: "Серия А",
    country: "Италия",
    round: "31-й тур",
    venue: "Сан-Сиро",
    kickoffISO: inHours(14),
    status: "upcoming",
    home: TEAMS.milan,
    away: TEAMS.napoli,
    lastFiveHome: ["W", "D", "W", "W", "L"],
    lastFiveAway: ["W", "W", "D", "W", "W"],
    aiPick: aiAway("Победа Наполи", 32, 26, 42, "MEDIUM"),
  },
  {
    id: "1011",
    sport: "football",
    league: "Лига чемпионов",
    country: "UEFA",
    round: "1/8 финала",
    venue: "Парк де Пренс",
    kickoffISO: inHours(0.1),
    status: "live",
    elapsedMinutes: 71,
    home: TEAMS.psg,
    away: TEAMS.dortmund,
    scoreHome: 2,
    scoreAway: 2,
    lastFiveHome: ["W", "W", "L", "W", "D"],
    lastFiveAway: ["W", "L", "W", "W", "L"],
    aiPick: aiHome("Победа ПСЖ", 49, 26, 25, "LOW"),
    liveStats: {
      possessionHome: 55,
      possessionAway: 45,
      shotsHome: 16,
      shotsAway: 12,
    },
  },
  {
    id: "1012",
    sport: "football",
    league: "Серия А",
    country: "Италия",
    round: "31-й тур",
    venue: "Олимпико",
    kickoffISO: inHours(20),
    status: "upcoming",
    home: TEAMS.roma,
    away: TEAMS.atletico,
    lastFiveHome: ["D", "W", "W", "L", "W"],
    lastFiveAway: ["W", "L", "D", "W", "L"],
    aiPick: aiHome("Победа Ромы", 47, 27, 26, "MEDIUM"),
  },

  {
    id: "1013",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "Chase Center",
    kickoffISO: inHours(4),
    status: "upcoming",
    home: TEAMS.warriors,
    away: TEAMS.nuggets,
    lastFiveHome: ["W", "W", "L", "W", "L"],
    lastFiveAway: ["W", "W", "W", "L", "W"],
    aiPick: aiAway("Победа Денвера", 46, null, 54, "MEDIUM"),
  },
  {
    id: "1014",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "Fiserv Forum",
    kickoffISO: inHours(6),
    status: "upcoming",
    home: TEAMS.bucks,
    away: TEAMS.suns,
    lastFiveHome: ["W", "W", "W", "L", "W"],
    lastFiveAway: ["L", "W", "L", "W", "W"],
    aiPick: aiHome("Победа Милуоки", 58, null, 42, "HIGH"),
  },
  {
    id: "1015",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "Madison Square Garden",
    kickoffISO: inHours(0.4),
    status: "live",
    elapsedMinutes: 32,
    home: TEAMS.knicks,
    away: TEAMS.heat,
    scoreHome: 78,
    scoreAway: 74,
    lastFiveHome: ["W", "W", "L", "W", "W"],
    lastFiveAway: ["L", "W", "W", "L", "W"],
    aiPick: aiHome("Победа Нью-Йорка", 53, null, 47, "MEDIUM"),
    liveStats: {
      possessionHome: 51,
      possessionAway: 49,
      shotsHome: 64,
      shotsAway: 60,
    },
  },
  {
    id: "1016",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "American Airlines Center",
    kickoffISO: inHours(9),
    status: "upcoming",
    home: TEAMS.mavericks,
    away: TEAMS.sixers,
    lastFiveHome: ["W", "L", "W", "W", "L"],
    lastFiveAway: ["W", "W", "L", "D", "W"],
    aiPick: aiHome("Победа Далласа", 55, null, 45, "MEDIUM"),
  },
  {
    id: "1017",
    sport: "basketball",
    league: "NBA",
    country: "США",
    round: "Регулярный",
    venue: "TD Garden",
    kickoffISO: inHours(22),
    status: "upcoming",
    home: TEAMS.celtics,
    away: TEAMS.bucks,
    lastFiveHome: ["W", "W", "W", "L", "W"],
    lastFiveAway: ["W", "W", "W", "L", "W"],
    aiPick: aiHome("Победа Бостона", 52, null, 48, "LOW"),
  },

  {
    id: "1018",
    sport: "tennis",
    league: "ATP Madrid",
    country: "Испания",
    round: "Полуфинал",
    venue: "Caja Mágica",
    kickoffISO: inHours(2),
    status: "upcoming",
    home: TEAMS.djokovic,
    away: TEAMS.medvedev,
    lastFiveHome: ["W", "W", "W", "L", "W"],
    lastFiveAway: ["W", "L", "W", "W", "W"],
    aiPick: aiHome("Победа Джоковича", 58, null, 42, "HIGH"),
  },
  {
    id: "1019",
    sport: "tennis",
    league: "ATP Madrid",
    country: "Испания",
    round: "1/4 финала",
    venue: "Caja Mágica",
    kickoffISO: inHours(0.05),
    status: "live",
    elapsedMinutes: 64,
    home: TEAMS.rune,
    away: TEAMS.tsitsipas,
    scoreHome: 1,
    scoreAway: 1,
    lastFiveHome: ["W", "L", "W", "L", "W"],
    lastFiveAway: ["W", "W", "L", "W", "L"],
    aiPick: aiAway("Победа Циципаса", 46, null, 54, "LOW"),
    liveStats: {
      possessionHome: 48,
      possessionAway: 52,
      shotsHome: 18,
      shotsAway: 21,
    },
  },
  {
    id: "1020",
    sport: "tennis",
    league: "ATP Madrid",
    country: "Испания",
    round: "1/4 финала",
    venue: "Caja Mágica",
    kickoffISO: inHours(5),
    status: "upcoming",
    home: TEAMS.zverev,
    away: TEAMS.rublev,
    lastFiveHome: ["W", "W", "L", "W", "W"],
    lastFiveAway: ["L", "W", "W", "L", "L"],
    aiPick: aiHome("Победа Зверева", 56, null, 44, "MEDIUM"),
  },
  {
    id: "1021",
    sport: "tennis",
    league: "ATP Madrid",
    country: "Испания",
    round: "1/8 финала",
    venue: "Caja Mágica",
    kickoffISO: inHours(12),
    status: "upcoming",
    home: TEAMS.fritz,
    away: TEAMS.dimitrov,
    lastFiveHome: ["W", "W", "L", "W", "L"],
    lastFiveAway: ["W", "L", "W", "W", "W"],
    aiPick: aiAway("Победа Димитрова", 45, null, 55, "MEDIUM"),
  },
  {
    id: "1022",
    sport: "tennis",
    league: "ATP Rome",
    country: "Италия",
    round: "Квалификация",
    venue: "Foro Italico",
    kickoffISO: inHours(28),
    status: "upcoming",
    home: TEAMS.alcaraz,
    away: TEAMS.sinner,
    lastFiveHome: ["W", "W", "L", "W", "W"],
    lastFiveAway: ["W", "W", "W", "L", "W"],
    aiPick: aiAway("Победа Синнера", 48, null, 52, "LOW"),
  },

  {
    id: "1023",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(4),
    status: "upcoming",
    home: TEAMS.usa,
    away: TEAMS.brazil,
    lastFiveHome: ["W", "W", "L", "W", "W"],
    lastFiveAway: ["W", "L", "W", "W", "L"],
    aiPick: aiAway("Победа Бразилии", 47, null, 53, "MEDIUM"),
  },
  {
    id: "1024",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(0.3),
    status: "live",
    elapsedMinutes: 48,
    home: TEAMS.argentina,
    away: TEAMS.france,
    scoreHome: 1,
    scoreAway: 2,
    lastFiveHome: ["W", "L", "W", "L", "W"],
    lastFiveAway: ["W", "W", "L", "W", "L"],
    aiPick: aiAway("Победа Франции", 41, null, 59, "MEDIUM"),
    liveStats: {
      possessionHome: 47,
      possessionAway: 53,
      shotsHome: 22,
      shotsAway: 28,
    },
  },
  {
    id: "1025",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(10),
    status: "upcoming",
    home: TEAMS.slovenia,
    away: TEAMS.cuba,
    lastFiveHome: ["W", "W", "W", "L", "W"],
    lastFiveAway: ["L", "W", "L", "W", "L"],
    aiPick: aiHome("Победа Словении", 62, null, 38, "HIGH"),
  },
  {
    id: "1026",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(18),
    status: "upcoming",
    home: TEAMS.japan,
    away: TEAMS.serbia,
    lastFiveHome: ["W", "L", "W", "W", "W"],
    lastFiveAway: ["W", "W", "L", "W", "W"],
    aiPick: aiAway("Победа Сербии", 46, null, 54, "MEDIUM"),
  },
  {
    id: "1027",
    sport: "volleyball",
    league: "VNL",
    country: "Мир",
    round: "Групповой этап",
    kickoffISO: inHours(32),
    status: "upcoming",
    home: TEAMS.italy,
    away: TEAMS.usa,
    lastFiveHome: ["L", "W", "W", "L", "W"],
    lastFiveAway: ["W", "W", "L", "W", "W"],
    aiPick: aiAway("Победа США", 45, null, 55, "LOW"),
  },
];

/** Всего завершённых матчей в моке истории (>300). Точность ровно 85%: 272 / 320. */
export const MOCK_HISTORY_TOTAL = 320;
const MOCK_HISTORY_CORRECT = Math.round((MOCK_HISTORY_TOTAL * 85) / 100);

const FOOTBALL_HISTORY_TEAMS: Team[] = [
  TEAMS.realMadrid,
  TEAMS.manCity,
  TEAMS.arsenal,
  TEAMS.liverpool,
  TEAMS.barcelona,
  TEAMS.atletico,
  TEAMS.bayern,
  TEAMS.psg,
  TEAMS.chelsea,
  TEAMS.inter,
  TEAMS.tottenham,
  TEAMS.manUnited,
  TEAMS.juventus,
  TEAMS.milan,
  TEAMS.napoli,
  TEAMS.dortmund,
  TEAMS.roma,
];

const BASKETBALL_HISTORY_TEAMS: Team[] = [
  TEAMS.lakers,
  TEAMS.celtics,
  TEAMS.warriors,
  TEAMS.nuggets,
  TEAMS.bucks,
  TEAMS.suns,
  TEAMS.knicks,
  TEAMS.heat,
  TEAMS.mavericks,
  TEAMS.sixers,
];

const TENNIS_HISTORY_TEAMS: Team[] = [
  TEAMS.sinner,
  TEAMS.alcaraz,
  TEAMS.djokovic,
  TEAMS.medvedev,
  TEAMS.rune,
  TEAMS.tsitsipas,
  TEAMS.zverev,
  TEAMS.rublev,
  TEAMS.fritz,
  TEAMS.dimitrov,
];

const VOLLEYBALL_HISTORY_TEAMS: Team[] = [
  TEAMS.poland,
  TEAMS.italy,
  TEAMS.brazil,
  TEAMS.france,
  TEAMS.usa,
  TEAMS.argentina,
  TEAMS.slovenia,
  TEAMS.cuba,
  TEAMS.japan,
  TEAMS.serbia,
];

const FOOTBALL_LEAGUES = [
  { league: "АПЛ", country: "Англия", round: "Тур" },
  { league: "Ла Лига", country: "Испания", round: "Тур" },
  { league: "Серия А", country: "Италия", round: "Тур" },
  { league: "Бундеслига", country: "Германия", round: "Тур" },
  { league: "Лига чемпионов", country: "UEFA", round: "Группа" },
] as const;

function historyForm(seed: number): FormResult[] {
  const o: FormResult[] = ["W", "D", "L"];
  return [0, 1, 2, 3, 4].map((j) => o[(seed + j * 2) % 3]);
}

function historyScores(
  sport: SportSlug,
  actual: "HOME" | "DRAW" | "AWAY"
): { scoreHome: number; scoreAway: number } {
  if (sport === "football") {
    if (actual === "HOME") return { scoreHome: 2, scoreAway: 0 };
    if (actual === "AWAY") return { scoreHome: 0, scoreAway: 2 };
    return { scoreHome: 1, scoreAway: 1 };
  }
  if (sport === "basketball") {
    if (actual === "HOME") return { scoreHome: 112, scoreAway: 104 };
    return { scoreHome: 98, scoreAway: 115 };
  }
  if (sport === "tennis") {
    if (actual === "HOME") return { scoreHome: 2, scoreAway: 1 };
    return { scoreHome: 0, scoreAway: 2 };
  }
  if (actual === "HOME") return { scoreHome: 3, scoreAway: 1 };
  return { scoreHome: 1, scoreAway: 3 };
}

function historyProbs(
  sport: SportSlug,
  predicted: "HOME" | "DRAW" | "AWAY"
): { probHome: number; probDraw: number | null; probAway: number } {
  const noDraw = sport !== "football";
  if (predicted === "HOME") {
    return noDraw
      ? { probHome: 58, probDraw: null, probAway: 42 }
      : { probHome: 54, probDraw: 24, probAway: 22 };
  }
  if (predicted === "AWAY") {
    return noDraw
      ? { probHome: 41, probDraw: null, probAway: 59 }
      : { probHome: 28, probDraw: 26, probAway: 46 };
  }
  return { probHome: 33, probDraw: 35, probAway: 32 };
}

function wrongPrediction(
  actual: "HOME" | "DRAW" | "AWAY",
  sport: SportSlug,
  salt: number
): "HOME" | "DRAW" | "AWAY" {
  const all = ["HOME", "DRAW", "AWAY"] as const;
  const candidates = all.filter((x) => x !== actual);
  if (sport !== "football") {
    const nonDraw = candidates.filter((x) => x !== "DRAW");
    return nonDraw[salt % nonDraw.length]!;
  }
  return candidates[salt % candidates.length]!;
}

function buildGeneratedHistory(): HistoryMatch[] {
  const rows: HistoryMatch[] = [];
  const sports: SportSlug[] = ["football", "basketball", "tennis", "volleyball"];

  for (let i = 0; i < MOCK_HISTORY_TOTAL; i++) {
    const sport = sports[i % 4]!;
    const pool =
      sport === "football"
        ? FOOTBALL_HISTORY_TEAMS
        : sport === "basketball"
        ? BASKETBALL_HISTORY_TEAMS
        : sport === "tennis"
        ? TENNIS_HISTORY_TEAMS
        : VOLLEYBALL_HISTORY_TEAMS;

    const hi = i % pool.length;
    let ai = (i * 5 + 2) % pool.length;
    if (ai === hi) ai = (ai + 1) % pool.length;
    const home = pool[hi]!;
    const away = pool[ai]!;

    const mod = Math.floor(i / 4) % 6;
    let actual: "HOME" | "DRAW" | "AWAY";
    if (sport === "football") {
      if (mod === 0) actual = "DRAW";
      else if (mod <= 3) actual = "HOME";
      else actual = "AWAY";
    } else {
      actual = mod % 2 === 0 ? "HOME" : "AWAY";
    }

    const isCorrect = i < MOCK_HISTORY_CORRECT;
    const predicted = isCorrect
      ? actual
      : wrongPrediction(actual, sport, i);

    const { scoreHome, scoreAway } = historyScores(sport, actual);

    const outcome =
      predicted === "DRAW"
        ? "Ничья"
        : predicted === "HOME"
        ? `Победа ${home.name}`
        : `Победа ${away.name}`;

    const probs = historyProbs(sport, predicted);
    const confidence: Confidence =
      i % 5 === 0 ? "HIGH" : i % 5 === 2 ? "LOW" : "MEDIUM";

    const fl = FOOTBALL_LEAGUES[i % FOOTBALL_LEAGUES.length]!;
    const meta =
      sport === "football"
        ? { league: fl.league, country: fl.country, round: `${fl.round} ${(i % 34) + 1}` }
        : sport === "basketball"
        ? { league: "NBA", country: "США", round: "Регулярный" }
        : sport === "tennis"
        ? { league: "ATP 1000", country: "Мир", round: `${(i % 4) + 1} / 8` }
        : { league: "VNL", country: "Мир", round: "Групповой этап" };

    const hoursBack = 6 + i * 0.22;
    const kickoffISO = hoursAgo(hoursBack + 2);
    const finishedISO = hoursAgo(hoursBack);

    rows.push({
      id: `h${String(i + 1).padStart(5, "0")}`,
      sport,
      league: meta.league,
      country: meta.country,
      round: meta.round,
      kickoffISO,
      finishedISO,
      status: "finished",
      home,
      away,
      scoreHome,
      scoreAway,
      actualOutcome: actual,
      lastFiveHome: historyForm(i),
      lastFiveAway: historyForm(i + 19),
      prediction: {
        ...probs,
        outcome,
        confidence,
        summary: `Модель отдавала преимущество: ${outcome}.`,
        reasoning:
          "Сводка по форме, очным встречам и составу на матч (синтетический мок для демонстрации точности).",
      },
    });
  }

  return rows.sort(
    (a, b) =>
      new Date(b.finishedISO).getTime() - new Date(a.finishedISO).getTime()
  );
}

export const MOCK_HISTORY: HistoryMatch[] = buildGeneratedHistory();

export function getMockMatchById(id: string): Match | undefined {
  return [...MOCK_MATCHES, ...MOCK_HISTORY].find((m) => m.id === id);
}

export function getMockHistoryById(id: string): HistoryMatch | undefined {
  return MOCK_HISTORY.find((m) => m.id === id);
}

export function getMockAnalysis(matchId: string): FullAnalysis {
  const match = getMockMatchById(matchId) ?? MOCK_MATCHES[0];
  const isLive = match.status === "live";

  const probabilities = match.aiPick?.probabilities ?? {
    home: 48,
    draw: 22,
    away: 30,
  };

  return {
    matchId,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (isLive ? 2 : 15) * 60_000).toISOString(),
    isLive,
    isPro: false,
    probabilities,
    recommendation: {
      outcome: match.aiPick?.outcome ?? `Победа: ${match.home.name}`,
      confidence: match.aiPick?.confidence ?? "HIGH",
      reasoning:
        "Хозяева в отличной форме (4 победы подряд), играют дома, у соперника травмы ключевых игроков защиты.",
    },
    summary:
      "Хозяева — фавориты. Высокая вероятность победы за счёт домашнего фактора и формы.",
    detailedAnalysis:
      "Команда хозяев показывает выдающуюся атакующую игру в последних матчах: 11 голов в 4 встречах, средний xG — 2.4. Гости проводят серию из 3 матчей без побед, оборона пропускает в среднем 1.7 мяча. Ключевой фактор — отсутствие основного центрального защитника гостей и возвращение лидера хозяев после дисквалификации. Тактически ожидается высокий прессинг и быстрые фланговые атаки.",
    keyFactors: [
      { factor: "Домашняя серия из 7 побед подряд", impact: "POSITIVE_HOME" },
      { factor: "Травма основного защитника гостей", impact: "POSITIVE_HOME" },
      { factor: "Возвращение бомбардира после дисквалификации", impact: "POSITIVE_HOME" },
      { factor: "Гости лучше играют в выездных матчах против топ-клубов", impact: "POSITIVE_AWAY" },
      { factor: "Судья известен лояльностью к жёсткой игре", impact: "NEUTRAL" },
    ],
    newsImpact: [
      {
        headline: "Капитан хозяев восстановился к матчу",
        impact: "Усиление атаки и лидерство на поле",
        team: match.home.name,
      },
      {
        headline: "Главный тренер гостей под давлением",
        impact: "Возможны тактические эксперименты",
        team: match.away.name,
      },
    ],
    stats: [
      { label: "Владение мячом", home: match.liveStats?.possessionHome ?? 58, away: match.liveStats?.possessionAway ?? 42, unit: "%" },
      { label: "Удары", home: match.liveStats?.shotsHome ?? 14, away: match.liveStats?.shotsAway ?? 9 },
      { label: "Удары в створ", home: 6, away: 3 },
      { label: "Угловые", home: 7, away: 4 },
      { label: "xG", home: 2, away: 1 },
    ],
    homeForm: (match.lastFiveHome ?? ["W", "W", "D", "W", "W"]).map((r, i) => ({
      result: r,
      opponent: ["Бавария", "Челси", "ПСЖ", "Севилья", "Валенсия"][i] ?? "—",
      score: ["3:1", "2:0", "1:1", "4:0", "2:1"][i] ?? "0:0",
    })),
    awayForm: (match.lastFiveAway ?? ["L", "D", "W", "L", "W"]).map((r, i) => ({
      result: r,
      opponent: ["Тоттенхэм", "Аякс", "Лейпциг", "Реал", "Брайтон"][i] ?? "—",
      score: ["1:2", "0:0", "3:2", "0:1", "2:0"][i] ?? "0:0",
    })),
  };
}
