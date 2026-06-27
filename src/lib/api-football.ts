const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

type ApiMatch = {
  id: number;
  utcDate: string;
  stage: string;
  group: string | null;
  status: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

type ApiResponse = {
  matches: ApiMatch[];
};

const TEAM_FLAG_MAP: Record<string, string> = {
  "United States": "🇺🇸",
  "USA": "🇺🇸",
  "Mexico": "🇲🇽",
  "Canada": "🇨🇦",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Spain": "🇪🇸",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Portugal": "🇵🇹",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Italy": "🇮🇹",
  "Croatia": "🇭🇷",
  "Poland": "🇵🇱",
  "Switzerland": "🇨🇭",
  "Denmark": "🇩🇰",
  "Austria": "🇦🇹",
  "Serbia": "🇷🇸",
  "Ukraine": "🇺🇦",
  "Turkey": "🇹🇷",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "Australia": "🇦🇺",
  "Morocco": "🇲🇦",
  "Senegal": "🇸🇳",
  "Nigeria": "🇳🇬",
  "Egypt": "🇪🇬",
  "Cameroon": "🇨🇲",
  "South Africa": "🇿🇦",
  "Tunisia": "🇹🇳",
  "Ivory Coast": "🇨🇮",
  "Colombia": "🇨🇴",
  "Uruguay": "🇺🇾",
  "Ecuador": "🇪🇨",
  "Chile": "🇨🇱",
  "Peru": "🇵🇪",
  "Panama": "🇵🇦",
  "Costa Rica": "🇨🇷",
  "Saudi Arabia": "🇸🇦",
  "Iran": "🇮🇷",
  "Qatar": "🇶🇦",
  "Paraguay": "🇵🇾",
  "Venezuela": "🇻🇪",
  "Albania": "🇦🇱",
  "Zambia": "🇿🇲",
  "New Zealand": "🇳🇿",
  "Iraq": "🇮🇶",
};

export function getFlag(teamName: string): string {
  return TEAM_FLAG_MAP[teamName] ?? "🏳️";
}

const STAGE_MAP: Record<string, string> = {
  "GROUP_STAGE": "GROUP",
  "LAST_32": "ROUND_OF_32",
  "LAST_16": "ROUND_OF_16",
  "QUARTER_FINALS": "QUARTER_FINAL",
  "SEMI_FINALS": "SEMI_FINAL",
  "FINAL": "FINAL",
};

const STATUS_MAP: Record<string, string> = {
  "SCHEDULED": "SCHEDULED",
  "TIMED": "SCHEDULED",
  "IN_PLAY": "LIVE",
  "PAUSED": "LIVE",
  "FINISHED": "FINISHED",
};

export async function fetchWKMatches(): Promise<{
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  date: Date;
  stage: string;
  round: string;
  status: string;
}[]> {
  if (!API_KEY) throw new Error("FOOTBALL_API_KEY is niet ingesteld");

  // Workaround for SSL certificate issues on Windows
  const fetchOptions: any = {
    headers: { "X-Auth-Token": API_KEY },
    next: { revalidate: 300 },
  };

  if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const res = await fetch(`${BASE_URL}/competitions/WC/matches?season=2026`, fetchOptions);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API fout ${res.status}: ${text}`);
  }

  const data: ApiResponse = await res.json();

  return data.matches.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam.shortName || m.homeTeam.name,
    awayTeam: m.awayTeam.shortName || m.awayTeam.name,
    homeFlag: getFlag(m.homeTeam.name),
    awayFlag: getFlag(m.awayTeam.name),
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    date: new Date(m.utcDate),
    stage: STAGE_MAP[m.stage] ?? "GROUP",
    round: m.group ?? m.stage,
    status: STATUS_MAP[m.status] ?? "SCHEDULED",
  }));
}
