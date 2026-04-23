export type Team = {
  name: string;
  flag: string;
  code: string;
  group: string;
};

export const WK_TEAMS: Team[] = [
  // Groep A (Gastheer: Mexico)
  { name: "Mexico",             flag: "🇲🇽", code: "MEX", group: "A" },
  { name: "Zuid-Afrika",        flag: "🇿🇦", code: "RSA", group: "A" },
  { name: "Zuid-Korea",         flag: "🇰🇷", code: "KOR", group: "A" },
  { name: "Tsjechië",           flag: "🇨🇿", code: "CZE", group: "A" },

  // Groep B (Gastheer: Canada)
  { name: "Canada",             flag: "🇨🇦", code: "CAN", group: "B" },
  { name: "Bosnië-Herzegovina", flag: "🇧🇦", code: "BIH", group: "B" },
  { name: "Qatar",              flag: "🇶🇦", code: "QAT", group: "B" },
  { name: "Zwitserland",        flag: "🇨🇭", code: "SUI", group: "B" },

  // Groep C
  { name: "Brazilië",           flag: "🇧🇷", code: "BRA", group: "C" },
  { name: "Marokko",            flag: "🇲🇦", code: "MAR", group: "C" },
  { name: "Haïti",              flag: "🇭🇹", code: "HAI", group: "C" },
  { name: "Schotland",          flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO", group: "C" },

  // Groep D (Gastheer: USA)
  { name: "USA",                flag: "🇺🇸", code: "USA", group: "D" },
  { name: "Paraguay",           flag: "🇵🇾", code: "PAR", group: "D" },
  { name: "Australië",          flag: "🇦🇺", code: "AUS", group: "D" },
  { name: "Turkije",            flag: "🇹🇷", code: "TUR", group: "D" },

  // Groep E
  { name: "Duitsland",          flag: "🇩🇪", code: "GER", group: "E" },
  { name: "Curaçao",            flag: "🇨🇼", code: "CUR", group: "E" },
  { name: "Ivoorkust",          flag: "🇨🇮", code: "CIV", group: "E" },
  { name: "Ecuador",            flag: "🇪🇨", code: "ECU", group: "E" },

  // Groep F
  { name: "Nederland",          flag: "🇳🇱", code: "NED", group: "F" },
  { name: "Japan",              flag: "🇯🇵", code: "JPN", group: "F" },
  { name: "Zweden",             flag: "🇸🇪", code: "SWE", group: "F" },
  { name: "Tunesië",            flag: "🇹🇳", code: "TUN", group: "F" },

  // Groep G
  { name: "België",             flag: "🇧🇪", code: "BEL", group: "G" },
  { name: "Egypte",             flag: "🇪🇬", code: "EGY", group: "G" },
  { name: "Iran",               flag: "🇮🇷", code: "IRN", group: "G" },
  { name: "Nieuw-Zeeland",      flag: "🇳🇿", code: "NZL", group: "G" },

  // Groep H
  { name: "Spanje",             flag: "🇪🇸", code: "ESP", group: "H" },
  { name: "Kaapverdië",         flag: "🇨🇻", code: "CPV", group: "H" },
  { name: "Saoedi-Arabië",      flag: "🇸🇦", code: "KSA", group: "H" },
  { name: "Uruguay",            flag: "🇺🇾", code: "URU", group: "H" },

  // Groep I
  { name: "Frankrijk",          flag: "🇫🇷", code: "FRA", group: "I" },
  { name: "Senegal",            flag: "🇸🇳", code: "SEN", group: "I" },
  { name: "Irak",               flag: "🇮🇶", code: "IRQ", group: "I" },
  { name: "Noorwegen",          flag: "🇳🇴", code: "NOR", group: "I" },

  // Groep J
  { name: "Argentinië",         flag: "🇦🇷", code: "ARG", group: "J" },
  { name: "Algerije",           flag: "🇩🇿", code: "ALG", group: "J" },
  { name: "Oostenrijk",         flag: "🇦🇹", code: "AUT", group: "J" },
  { name: "Jordanië",           flag: "🇯🇴", code: "JOR", group: "J" },

  // Groep K
  { name: "Portugal",           flag: "🇵🇹", code: "POR", group: "K" },
  { name: "Congo",              flag: "🇨🇩", code: "COD", group: "K" },
  { name: "Oezbekistan",        flag: "🇺🇿", code: "UZB", group: "K" },
  { name: "Colombia",           flag: "🇨🇴", code: "COL", group: "K" },

  // Groep L
  { name: "Engeland",           flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", group: "L" },
  { name: "Kroatië",            flag: "🇭🇷", code: "CRO", group: "L" },
  { name: "Ghana",              flag: "🇬🇭", code: "GHA", group: "L" },
  { name: "Panama",             flag: "🇵🇦", code: "PAN", group: "L" },
];

// ── Team sterkte (gebaseerd op FIFA ranking jan 2026) ──────────────────────
export const TEAM_RATING: Record<string, number> = {
  "Argentinië":         96,
  "Frankrijk":          94,
  "Spanje":             93,
  "Brazilië":           92,
  "Engeland":           90,
  "Duitsland":          88,
  "Portugal":           87,
  "Nederland":          85,
  "België":             83,
  "Kroatië":            82,
  "Uruguay":            80,
  "Colombia":           79,
  "Japan":              78,
  "Marokko":            76,
  "Zwitserland":        75,
  "USA":                74,
  "Zweden":             73,
  "Mexico":             72,
  "Schotland":          72,
  "Senegal":            71,
  "Turkije":            70,
  "Zuid-Korea":         70,
  "Australië":          69,
  "Noorwegen":          68,
  "Ecuador":            68,
  "Oostenrijk":         67,
  "Tsjechië":           63,
  "Algerije":           62,
  "Zuid-Afrika":        60,
  "Ghana":              60,
  "Ivoorkust":          58,
  "Egypte":             56,
  "Tunesië":            55,
  "Saoedi-Arabië":      55,
  "Bosnië-Herzegovina": 55,
  "Iran":               52,
  "Congo":              52,
  "Paraguay":           49,
  "Irak":               49,
  "Jordanië":           49,
  "Panama":             46,
  "Kaapverdië":         46,
  "Qatar":              44,
  "Oezbekistan":        44,
  "Curaçao":            42,
  "Nieuw-Zeeland":      42,
  "Haïti":              38,
};

export function getSuggestedScore(homeTeam: string, awayTeam: string): { h: number; a: number } {
  const hr = TEAM_RATING[homeTeam] ?? 60;
  const ar = TEAM_RATING[awayTeam] ?? 60;
  const diff = (hr - ar) + 6; // thuisvoordeel

  if (diff >= 35) return { h: 5, a: 0 };
  if (diff >= 28) return { h: 4, a: 0 };
  if (diff >= 20) return { h: 3, a: 0 };
  if (diff >= 13) return { h: 2, a: 0 };
  if (diff >=  6) return { h: 2, a: 1 };
  if (diff >=  1) return { h: 1, a: 0 };
  if (diff >= -1) return { h: 1, a: 1 };
  if (diff >= -6) return { h: 0, a: 1 };
  if (diff >= -13) return { h: 1, a: 2 };
  if (diff >= -20) return { h: 0, a: 3 };
  if (diff >= -28) return { h: 0, a: 4 };
  return { h: 0, a: 5 };
}

export function getTeamByName(name: string): Team | undefined {
  return WK_TEAMS.find((t) => t.name === name);
}

const FLAG_ISO2: Record<string, string> = {
  // Nederlands
  "Mexico": "mx", "Zuid-Afrika": "za", "Zuid-Korea": "kr", "Tsjechië": "cz",
  "Canada": "ca", "Bosnië-Herzegovina": "ba", "Qatar": "qa", "Zwitserland": "ch",
  "Brazilië": "br", "Marokko": "ma", "Haïti": "ht", "Schotland": "gb-sct",
  "USA": "us", "Paraguay": "py", "Australië": "au", "Turkije": "tr",
  "Duitsland": "de", "Curaçao": "cw", "Ivoorkust": "ci", "Ecuador": "ec",
  "Nederland": "nl", "Japan": "jp", "Zweden": "se", "Tunesië": "tn",
  "België": "be", "Egypte": "eg", "Iran": "ir", "Nieuw-Zeeland": "nz",
  "Spanje": "es", "Kaapverdië": "cv", "Saoedi-Arabië": "sa", "Uruguay": "uy",
  "Frankrijk": "fr", "Senegal": "sn", "Irak": "iq", "Noorwegen": "no",
  "Argentinië": "ar", "Algerije": "dz", "Oostenrijk": "at", "Jordanië": "jo",
  "Portugal": "pt", "Congo": "cd", "Oezbekistan": "uz", "Colombia": "co",
  "Engeland": "gb-eng", "Kroatië": "hr", "Ghana": "gh", "Panama": "pa",
  // Engels (API-namen)
  "South Africa": "za", "Korea Republic": "kr", "Czechia": "cz",
  "Bosnia and Herzegovina": "ba", "Bosnia-Herzegovina": "ba", "Bosnia-H.": "ba",
  "Switzerland": "ch", "Brazil": "br", "Morocco": "ma", "Haiti": "ht",
  "Scotland": "gb-sct", "Australia": "au", "Turkey": "tr", "Germany": "de",
  "Ivory Coast": "ci", "Netherlands": "nl", "Sweden": "se", "Tunisia": "tn",
  "Belgium": "be", "Egypt": "eg", "New Zealand": "nz", "Spain": "es",
  "Cape Verde": "cv", "Saudi Arabia": "sa", "France": "fr", "Iraq": "iq",
  "Norway": "no", "Argentina": "ar", "Algeria": "dz", "Austria": "at",
  "Jordan": "jo", "DR Congo": "cd", "Congo DR": "cd", "Uzbekistan": "uz",
  "England": "gb-eng", "Croatia": "hr", "United States": "us", "South Korea": "kr",
};

export function getFlagUrl(teamName: string): string {
  const iso2 = FLAG_ISO2[teamName];
  if (!iso2) return "";
  return `https://flagcdn.com/w40/${iso2}.png`;
}

export function getFlag(teamName: string): string {
  return WK_TEAMS.find((t) => t.name === teamName)?.flag ?? "🏳️";
}

export function getCode(teamName: string): string {
  return WK_TEAMS.find((t) => t.name === teamName)?.code ?? teamName.slice(0, 3).toUpperCase();
}

export const WK_STAGE_LABELS: Record<string, string> = {
  GROUP: "Groepsfase",
  ROUND_OF_32: "Ronde van 32",
  ROUND_OF_16: "Achtste finale",
  QUARTER_FINAL: "Kwartfinale",
  SEMI_FINAL: "Halve finale",
  FINAL: "Finale",
};
