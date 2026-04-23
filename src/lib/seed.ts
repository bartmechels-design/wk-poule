import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────────────
// Tijden in UTC (CEST = UTC+2, dus NL-tijd minus 2 uur)
function d(dateStr: string, hour: number, minute = 0) {
  return new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
}

// ── Vlaggen ────────────────────────────────────────────────────────────────
const F: Record<string, string> = {
  "Mexico": "🇲🇽", "Zuid-Afrika": "🇿🇦", "Zuid-Korea": "🇰🇷", "Tsjechië": "🇨🇿",
  "Canada": "🇨🇦", "Bosnië-Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Zwitserland": "🇨🇭",
  "Brazilië": "🇧🇷", "Marokko": "🇲🇦", "Haïti": "🇭🇹", "Schotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA": "🇺🇸", "Paraguay": "🇵🇾", "Australië": "🇦🇺", "Turkije": "🇹🇷",
  "Duitsland": "🇩🇪", "Curaçao": "🇨🇼", "Ivoorkust": "🇨🇮", "Ecuador": "🇪🇨",
  "Nederland": "🇳🇱", "Japan": "🇯🇵", "Zweden": "🇸🇪", "Tunesië": "🇹🇳",
  "België": "🇧🇪", "Egypte": "🇪🇬", "Iran": "🇮🇷", "Nieuw-Zeeland": "🇳🇿",
  "Spanje": "🇪🇸", "Kaapverdië": "🇨🇻", "Saoedi-Arabië": "🇸🇦", "Uruguay": "🇺🇾",
  "Frankrijk": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noorwegen": "🇳🇴",
  "Argentinië": "🇦🇷", "Algerije": "🇩🇿", "Oostenrijk": "🇦🇹", "Jordanië": "🇯🇴",
  "Portugal": "🇵🇹", "Congo": "🇨🇩", "Oezbekistan": "🇺🇿", "Colombia": "🇨🇴",
  "Engeland": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Kroatië": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦",
};

function m(home: string, away: string, date: Date, round: string) {
  return { homeTeam: home, awayTeam: away, homeFlag: F[home] ?? "🏳️", awayFlag: F[away] ?? "🏳️", date, stage: "GROUP", round };
}

// ── WK 2026 Groepsfase – alle 72 wedstrijden ──────────────────────────────
// Officiële loting: 5 december 2025, Washington D.C.
// Groepsfase: 11 juni – 28 juni 2026
// Tijden zijn UTC (NL-tijd = UTC+2)

const WEDSTRIJDEN = [

  // ────────────────────────────────────────────
  // GROEP A: Mexico • Zuid-Afrika • Zuid-Korea • Tsjechië
  // ────────────────────────────────────────────
  m("Mexico",     "Zuid-Afrika",  d("2026-06-11", 19),     "Groep A"),  // 21:00 NL
  m("Zuid-Korea", "Tsjechië",     d("2026-06-12",  2),     "Groep A"),  // 04:00 NL
  m("Tsjechië",   "Zuid-Afrika",  d("2026-06-18", 16),     "Groep A"),  // 18:00 NL
  m("Mexico",     "Zuid-Korea",   d("2026-06-19",  1),     "Groep A"),  // 03:00 NL
  m("Tsjechië",   "Mexico",       d("2026-06-25",  1),     "Groep A"),  // 03:00 NL (simultaan)
  m("Zuid-Afrika","Zuid-Korea",   d("2026-06-25",  1),     "Groep A"),  // 03:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP B: Canada • Bosnië-Herzegovina • Qatar • Zwitserland
  // ────────────────────────────────────────────
  m("Canada",             "Bosnië-Herzegovina", d("2026-06-12", 19),     "Groep B"),  // 21:00 NL
  m("Qatar",              "Zwitserland",        d("2026-06-13", 19),     "Groep B"),  // 21:00 NL
  m("Zwitserland",        "Bosnië-Herzegovina", d("2026-06-18", 19),     "Groep B"),  // 21:00 NL
  m("Canada",             "Qatar",              d("2026-06-18", 22),     "Groep B"),  // 00:00 NL (19 juni)
  m("Zwitserland",        "Canada",             d("2026-06-24", 19),     "Groep B"),  // 21:00 NL (simultaan)
  m("Bosnië-Herzegovina", "Qatar",              d("2026-06-24", 19),     "Groep B"),  // 21:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP C: Brazilië • Marokko • Haïti • Schotland
  // ────────────────────────────────────────────
  m("Brazilië",  "Marokko",   d("2026-06-13", 22),     "Groep C"),  // 00:00 NL (14 juni)
  m("Haïti",     "Schotland", d("2026-06-14",  1),     "Groep C"),  // 03:00 NL
  m("Schotland", "Marokko",   d("2026-06-19", 22),     "Groep C"),  // 00:00 NL (20 juni)
  m("Brazilië",  "Haïti",     d("2026-06-20",  1),     "Groep C"),  // 03:00 NL
  m("Schotland", "Brazilië",  d("2026-06-24", 22),     "Groep C"),  // 00:00 NL (simultaan)
  m("Marokko",   "Haïti",     d("2026-06-24", 22),     "Groep C"),  // 00:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP D: USA • Paraguay • Australië • Turkije
  // ────────────────────────────────────────────
  m("USA",       "Paraguay",  d("2026-06-13",  1),     "Groep D"),  // 03:00 NL
  m("Australië", "Turkije",   d("2026-06-13",  4),     "Groep D"),  // 06:00 NL
  m("Turkije",   "Paraguay",  d("2026-06-19",  4),     "Groep D"),  // 06:00 NL
  m("USA",       "Australië", d("2026-06-19", 19),     "Groep D"),  // 21:00 NL
  m("Turkije",   "USA",       d("2026-06-26",  2),     "Groep D"),  // 04:00 NL (simultaan)
  m("Paraguay",  "Australië", d("2026-06-26",  2),     "Groep D"),  // 04:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP E: Duitsland • Curaçao • Ivoorkust • Ecuador
  // ────────────────────────────────────────────
  m("Duitsland", "Curaçao",   d("2026-06-14", 17),     "Groep E"),  // 19:00 NL
  m("Ivoorkust", "Ecuador",   d("2026-06-14", 23),     "Groep E"),  // 01:00 NL (15 juni)
  m("Duitsland", "Ivoorkust", d("2026-06-20", 20),     "Groep E"),  // 22:00 NL
  m("Ecuador",   "Curaçao",   d("2026-06-21",  0),     "Groep E"),  // 02:00 NL
  m("Ecuador",   "Duitsland", d("2026-06-25", 20),     "Groep E"),  // 22:00 NL (simultaan)
  m("Curaçao",   "Ivoorkust", d("2026-06-25", 20),     "Groep E"),  // 22:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP F: Nederland • Japan • Zweden • Tunesië
  // ────────────────────────────────────────────
  m("Nederland", "Japan",    d("2026-06-14", 20),     "Groep F"),  // 22:00 NL
  m("Zweden",    "Tunesië",  d("2026-06-15",  2),     "Groep F"),  // 04:00 NL
  m("Tunesië",   "Japan",    d("2026-06-20",  4),     "Groep F"),  // 06:00 NL
  m("Nederland", "Zweden",   d("2026-06-20", 17),     "Groep F"),  // 19:00 NL
  m("Japan",     "Zweden",   d("2026-06-25", 23),     "Groep F"),  // 01:00 NL (simultaan)
  m("Tunesië",   "Nederland",d("2026-06-25", 23),     "Groep F"),  // 01:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP G: België • Egypte • Iran • Nieuw-Zeeland
  // ────────────────────────────────────────────
  m("België",        "Egypte",       d("2026-06-15", 19),     "Groep G"),  // 21:00 NL
  m("Iran",          "Nieuw-Zeeland",d("2026-06-16",  1),     "Groep G"),  // 03:00 NL
  m("België",        "Iran",         d("2026-06-21", 19),     "Groep G"),  // 21:00 NL
  m("Nieuw-Zeeland", "Egypte",       d("2026-06-22",  1),     "Groep G"),  // 03:00 NL
  m("Egypte",        "Iran",         d("2026-06-27",  3),     "Groep G"),  // 05:00 NL (simultaan)
  m("Nieuw-Zeeland", "België",       d("2026-06-27",  3),     "Groep G"),  // 05:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP H: Spanje • Kaapverdië • Saoedi-Arabië • Uruguay
  // ────────────────────────────────────────────
  m("Spanje",        "Kaapverdië",   d("2026-06-15", 16),     "Groep H"),  // 18:00 NL
  m("Saoedi-Arabië", "Uruguay",      d("2026-06-15", 22),     "Groep H"),  // 00:00 NL (16 juni)
  m("Spanje",        "Saoedi-Arabië",d("2026-06-21", 16),     "Groep H"),  // 18:00 NL
  m("Uruguay",       "Kaapverdië",   d("2026-06-21", 22),     "Groep H"),  // 00:00 NL (22 juni)
  m("Kaapverdië",    "Saoedi-Arabië",d("2026-06-27",  0),     "Groep H"),  // 02:00 NL (simultaan)
  m("Uruguay",       "Spanje",       d("2026-06-27",  0),     "Groep H"),  // 02:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP I: Frankrijk • Senegal • Irak • Noorwegen
  // ────────────────────────────────────────────
  m("Frankrijk", "Senegal",  d("2026-06-16", 19),     "Groep I"),  // 21:00 NL
  m("Irak",      "Noorwegen",d("2026-06-16", 22),     "Groep I"),  // 00:00 NL (17 juni)
  m("Frankrijk", "Irak",     d("2026-06-22", 21),     "Groep I"),  // 23:00 NL
  m("Noorwegen", "Senegal",  d("2026-06-23",  0),     "Groep I"),  // 02:00 NL
  m("Noorwegen", "Frankrijk",d("2026-06-26", 19),     "Groep I"),  // 21:00 NL (simultaan)
  m("Senegal",   "Irak",     d("2026-06-26", 19),     "Groep I"),  // 21:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP J: Argentinië • Algerije • Oostenrijk • Jordanië
  // ────────────────────────────────────────────
  m("Oostenrijk", "Jordanië", d("2026-06-16",  4),     "Groep J"),  // 06:00 NL
  m("Argentinië", "Algerije", d("2026-06-17",  1),     "Groep J"),  // 03:00 NL
  m("Argentinië", "Oostenrijk",d("2026-06-22", 17),     "Groep J"), // 19:00 NL
  m("Jordanië",   "Algerije", d("2026-06-23",  3),     "Groep J"),  // 05:00 NL
  m("Algerije",   "Oostenrijk",d("2026-06-28",  2),     "Groep J"), // 04:00 NL (simultaan)
  m("Jordanië",   "Argentinië",d("2026-06-28",  2),     "Groep J"), // 04:00 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP K: Portugal • Congo • Oezbekistan • Colombia
  // ────────────────────────────────────────────
  m("Portugal",    "Congo",      d("2026-06-17", 17),     "Groep K"),  // 19:00 NL
  m("Oezbekistan", "Colombia",   d("2026-06-18",  2),     "Groep K"),  // 04:00 NL
  m("Portugal",    "Oezbekistan",d("2026-06-23", 17),     "Groep K"),  // 19:00 NL
  m("Colombia",    "Congo",      d("2026-06-24",  2),     "Groep K"),  // 04:00 NL
  m("Colombia",    "Portugal",   d("2026-06-27", 23, 30), "Groep K"),  // 01:30 NL (simultaan)
  m("Congo",       "Oezbekistan",d("2026-06-27", 23, 30), "Groep K"),  // 01:30 NL (simultaan)

  // ────────────────────────────────────────────
  // GROEP L: Engeland • Kroatië • Ghana • Panama
  // ────────────────────────────────────────────
  m("Engeland", "Kroatië", d("2026-06-17", 20),     "Groep L"),  // 22:00 NL
  m("Ghana",    "Panama",  d("2026-06-17", 23),     "Groep L"),  // 01:00 NL (18 juni)
  m("Engeland", "Ghana",   d("2026-06-23", 20),     "Groep L"),  // 22:00 NL
  m("Panama",   "Kroatië", d("2026-06-23", 23),     "Groep L"),  // 01:00 NL (24 juni)
  m("Panama",   "Engeland",d("2026-06-27", 21),     "Groep L"),  // 23:00 NL (simultaan)
  m("Kroatië",  "Ghana",   d("2026-06-27", 21),     "Groep L"),  // 23:00 NL (simultaan)
];

// ── Seed ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding WK 2026 groepsfase wedstrijden...");
  console.log("🗑️  Bestaande data verwijderen...");

  await db.prediction.deleteMany({});
  await db.tournamentPrediction.deleteMany({});
  await db.match.deleteMany({});

  // Reset leerlingpunten
  await db.student.updateMany({ data: { totalPoints: 0 } });

  console.log(`⚽ ${WEDSTRIJDEN.length} wedstrijden toevoegen...`);

  for (const w of WEDSTRIJDEN) {
    await db.match.create({ data: w });
  }

  // Statistieken
  const perGroep: Record<string, number> = {};
  for (const w of WEDSTRIJDEN) {
    perGroep[w.round] = (perGroep[w.round] ?? 0) + 1;
  }

  console.log("\n📊 Wedstrijden per groep:");
  for (const [groep, aantal] of Object.entries(perGroep)) {
    console.log(`   ${groep}: ${aantal} wedstrijden`);
  }

  console.log(`\n✅ ${WEDSTRIJDEN.length} wedstrijden succesvol geseed!`);
  console.log("📅 Groepsfase: 11 juni – 28 juni 2026");
  console.log("🏆 Loting: 5 december 2025, Washington D.C.");
  await db.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
