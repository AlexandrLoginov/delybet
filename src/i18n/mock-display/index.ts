import type { AppLocaleCode } from "@/lib/locale";

export type MockDisplayMaps = {
  teams: Record<string, string>;
  leagues: Record<string, string>;
  countries: Record<string, string>;
  rounds: Record<string, string>;
  venues: Record<string, string>;
  aiPicks: Record<string, string>;
  strings: Record<string, string>;
  analysisByMatchId: Record<
    string,
    { summary?: string; detailed?: string; reasoning?: string }
  >;
};

const TEAMS_EN: Record<string, string> = {
  "33": "Manchester United",
  "40": "Liverpool",
  "42": "Arsenal",
  "47": "Tottenham",
  "49": "Chelsea",
  "50": "Manchester City",
  "85": "Paris Saint-Germain",
  "157": "Bayern Munich",
  "165": "Borussia Dortmund",
  "489": "AC Milan",
  "492": "Napoli",
  "496": "Juventus",
  "497": "Roma",
  "505": "Inter Milan",
  "529": "Barcelona",
  "530": "Atletico Madrid",
  "541": "Real Madrid",
  "2001": "Jannik Sinner",
  "2002": "Carlos Alcaraz",
  "2003": "Novak Djokovic",
  "2004": "Daniil Medvedev",
  "2005": "Holger Rune",
  "2006": "Stefanos Tsitsipas",
  "2007": "Alexander Zverev",
  "2008": "Andrey Rublev",
  "2009": "Taylor Fritz",
  "2010": "Grigor Dimitrov",
  "3001": "Poland",
  "3002": "Italy",
  "3003": "Brazil",
  "3004": "France",
  "3005": "USA",
  "3006": "Argentina",
  "3007": "Slovenia",
  "3008": "Cuba",
  "3009": "Japan",
  "3010": "Serbia",
};

const LEAGUES_EN: Record<string, string> = {
  "Лига чемпионов": "Champions League",
  АПЛ: "Premier League",
  "Ла Лига": "La Liga",
  NBA: "NBA",
  "ATP Madrid": "ATP Madrid",
  VNL: "VNL",
  Бундеслига: "Bundesliga",
  "Серия А": "Serie A",
};

const COUNTRIES_EN: Record<string, string> = {
  UEFA: "UEFA",
  Англия: "England",
  Испания: "Spain",
  США: "USA",
  Мир: "World",
  Германия: "Germany",
  Италия: "Italy",
};

const ROUNDS_EN: Record<string, string> = {
  "1/8 финала": "Round of 16",
  "1/4 финала": "Quarter-final",
  "32-й тур": "Matchweek 32",
  "30-й тур": "Matchweek 30",
  "29-й тур": "Matchweek 29",
  "31-й тур": "Matchweek 31",
  Регулярный: "Regular season",
  Полуфинал: "Semi-final",
  "Групповой этап": "Group stage",
};

const VENUES_EN: Record<string, string> = {
  "Сантьяго Бернабеу": "Santiago Bernabéu",
  Эмирейтс: "Emirates Stadium",
  "Камп Ноу": "Camp Nou",
  "Альянц Арена": "Allianz Arena",
  "Олд Траффорд": "Old Trafford",
  "Альянц Стэдиум": "Allianz Stadium",
  "Сан-Сиро": "San Siro",
  "Парк де Пренс": "Parc des Princes",
  Олимпико: "Stadio Olimpico",
};

const AI_PICKS_EN: Record<string, string> = {
  "Победа Реала": "Real Madrid win",
  "Победа Арсенала": "Arsenal win",
  "Барса добьёт": "Barcelona to close it out",
  "Победа Бостона": "Boston win",
  "Победа Алькараса": "Alcaraz win",
  "Победа Польши": "Poland win",
  "Победа Баварии": "Bayern win",
  "Победа Челси": "Chelsea win",
  "Победа Интера": "Inter win",
  "Победа Наполи": "Napoli win",
  "Победа ПСЖ": "PSG win",
  "Победа Ромы": "Roma win",
  "Победа Денвера": "Denver win",
  "Победа Милуоки": "Milwaukee win",
  "Победа Нью-Йорка": "New York win",
  "Победа Далласа": "Dallas win",
  "Победа Джоковича": "Djokovic win",
  "Победа Циципаса": "Tsitsipas win",
  "Победа Зверева": "Zverev win",
  "Победа Димитрова": "Dimitrov win",
  "Победа Синнера": "Sinner win",
  "Победа Бразилии": "Brazil win",
  "Победа Франции": "France win",
  "Победа Словении": "Slovenia win",
  "Победа Сербии": "Serbia win",
  "Победа США": "USA win",
};

const STRINGS_EN: Record<string, string> = {
  "Хозяева — фавориты. Высокая вероятность победы за счёт домашнего фактора и формы.":
    "Hosts are favourites. High win probability thanks to home advantage and form.",
  "Команда хозяев показывает выдающуюся атакующую игру в последних матчах: 11 голов в 4 встречах, средний xG — 2.4. Гости проводят серию из 3 матчей без побед, оборона пропускает в среднем 1.7 мяча. Ключевой фактор — отсутствие основного центрального защитника гостей и возвращение лидера хозяев после дисквалификации. Тактически ожидается высокий прессинг и быстрые фланговые атаки.":
    "The hosts have been outstanding in attack lately: 11 goals in 4 games, average xG 2.4. The visitors are winless in 3, conceding 1.7 per game. A missing starting centre-back for the away side and the hosts' star returning from suspension tilt the model toward the home win. Expect a high press and quick wide attacks.",
  "Модель сочла домашнее преимущество и форму решающими; по рынку ожиданных голов — умеренный перевес на открытый футбол второго тайма.":
    "The model weighted home advantage and form heavily; goal markets lean slightly toward an open second half.",
  Исход: "Outcome",
  "Двойной шанс": "Double chance",
  "Тотал голов 2.5": "Total goals 2.5",
  "Обе забьют": "Both teams to score",
  "Домашняя серия из 7 побед подряд": "Seven straight home wins",
  "Травма основного защитника гостей": "Away starting centre-back injured",
  "Возвращение бомбардира после дисквалификации": "Star striker back from suspension",
  "Гости лучше играют в выездных матчах против топ-клубов":
    "Away side performs better on the road vs top clubs",
  "Судья известен лояльностью к жёсткой игре": "Referee allows physical play",
  "Владение мячом": "Possession",
  Удары: "Shots",
  "Удары в створ": "Shots on target",
  Угловые: "Corners",
};

const ANALYSIS_EN: MockDisplayMaps["analysisByMatchId"] = {
  "1001": {
    summary:
      "Hosts are favourites. High win probability thanks to home advantage and form.",
    detailed:
      "Real Madrid's attack has been sharp at home; Manchester City's away form is mixed. Home advantage and recent xG edge support the hosts.",
  },
};

function buildMaps(
  teams: Record<string, string>,
  leagues: Record<string, string>,
  countries: Record<string, string>,
  rounds: Record<string, string>,
  venues: Record<string, string>,
  aiPicks: Record<string, string>,
  strings: Record<string, string>,
  analysisByMatchId: MockDisplayMaps["analysisByMatchId"]
): MockDisplayMaps {
  return {
    teams,
    leagues,
    countries,
    rounds,
    venues,
    aiPicks,
    strings,
    analysisByMatchId,
  };
}

const EN = buildMaps(
  TEAMS_EN,
  LEAGUES_EN,
  COUNTRIES_EN,
  ROUNDS_EN,
  VENUES_EN,
  AI_PICKS_EN,
  STRINGS_EN,
  ANALYSIS_EN
);

const VI = buildMaps(
  TEAMS_EN,
  {
    "Лига чемпионов": "Champions League",
    АПЛ: "Ngoại hạng Anh",
    "Ла Лига": "La Liga",
    NBA: "NBA",
    "ATP Madrid": "ATP Madrid",
    VNL: "VNL",
    Бундеслига: "Bundesliga",
    "Серия А": "Serie A",
  },
  {
    UEFA: "UEFA",
    Англия: "Anh",
    Испания: "Tây Ban Nha",
    США: "Mỹ",
    Мир: "Thế giới",
    Германия: "Đức",
    Италия: "Ý",
  },
  {
    "1/8 финала": "Vòng 1/8",
    "1/4 финала": "Tứ kết",
    "32-й тур": "Vòng 32",
    "30-й тур": "Vòng 30",
    "29-й тур": "Vòng 29",
    "31-й тур": "Vòng 31",
    Регулярный: "Mùa chính",
    Полуфинал: "Bán kết",
    "Групповой этап": "Vòng bảng",
  },
  VENUES_EN,
  AI_PICKS_EN,
  {
    "Хозяева — фавориты. Высокая вероятность победы за счёт домашнего фактора и формы.":
      "Đội nhà được ưa chuộng. Xác suất thắng cao nhờ sân nhà và phong độ.",
    Исход: "Kết quả",
  },
  ANALYSIS_EN
);

const ZH = buildMaps(
  TEAMS_EN,
  {
    "Лига чемпионов": "欧冠",
    АПЛ: "英超",
    "Ла Лига": "西甲",
    NBA: "NBA",
    "ATP Madrid": "ATP马德里",
    VNL: "VNL",
    Бундеслига: "德甲",
    "Серия А": "意甲",
  },
  {
    UEFA: "UEFA",
    Англия: "英格兰",
    Испания: "西班牙",
    США: "美国",
    Мир: "世界",
    Германия: "德国",
    Италия: "意大利",
  },
  {
    "1/8 финала": "1/8决赛",
    "1/4 финала": "1/4决赛",
    "32-й тур": "第32轮",
    "30-й тур": "第30轮",
    "29-й тур": "第29轮",
    "31-й тур": "第31轮",
    Регулярный: "常规赛",
    Полуфинал: "半决赛",
    "Групповой этап": "小组赛",
  },
  VENUES_EN,
  AI_PICKS_EN,
  {
    "Хозяева — фавориты. Высокая вероятность победы за счёт домашнего фактора и формы.":
      "主队为热门，主场优势与状态带来较高胜率。",
    Исход: "赛果",
  },
  ANALYSIS_EN
);

const KO = buildMaps(
  TEAMS_EN,
  {
    "Лига чемпионов": "챔피언스리그",
    АПЛ: "프리미어리그",
    "Ла Лига": "라리가",
    NBA: "NBA",
    "ATP Madrid": "ATP 마드리드",
    VNL: "VNL",
    Бундеслига: "분데스리가",
    "Серия А": "세리에 A",
  },
  {
    UEFA: "UEFA",
    Англия: "잉글랜드",
    Испания: "스페인",
    США: "미국",
    Мир: "세계",
    Германия: "독일",
    Италия: "이탈리아",
  },
  {
    "1/8 финала": "16강",
    "1/4 финала": "8강",
    "32-й тур": "32라운드",
    "30-й тур": "30라운드",
    "29-й тур": "29라운드",
    "31-й тур": "31라운드",
    Регулярный: "정규시즌",
    Полуфинал: "준결승",
    "Групповой этап": "조별리그",
  },
  VENUES_EN,
  AI_PICKS_EN,
  {
    "Хозяева — фавориты. Высокая вероятность победы за счёт домашнего фактора и формы.":
      "홈팀이 우세합니다. 홈 이점과 최근 폼으로 승률이 높습니다.",
    Исход: "승패",
  },
  ANALYSIS_EN
);

const BY_LOCALE: Partial<Record<AppLocaleCode, MockDisplayMaps>> = {
  en: EN,
  vi: VI,
  zh: ZH,
  ko: KO,
};

export function getMockDisplayMaps(
  locale: AppLocaleCode
): MockDisplayMaps | null {
  if (locale === "ru") return null;
  return BY_LOCALE[locale] ?? EN;
}

export function translateMockString(
  maps: MockDisplayMaps | null,
  text: string
): string {
  if (!maps || !text) return text;
  return (
    maps.strings[text] ??
    maps.aiPicks[text] ??
    maps.leagues[text] ??
    maps.countries[text] ??
    maps.rounds[text] ??
    maps.venues[text] ??
    text
  );
}
