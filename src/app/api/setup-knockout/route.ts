import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET || "wk2026-cron-geheim-8f3kd92";

const knockoutMatches = [
  // Round of 32
  { homeTeam: "Zuid-Afrika", awayTeam: "Canada", date: new Date("2026-06-28T18:00:00Z"), stage: "ROUND_OF_32", round: "1" },
  { homeTeam: "Brazilië", awayTeam: "Japan", date: new Date("2026-06-29T13:00:00Z"), stage: "ROUND_OF_32", round: "2" },
  { homeTeam: "Duitsland", awayTeam: "Paraguay", date: new Date("2026-06-29T16:30:00Z"), stage: "ROUND_OF_32", round: "3" },
  { homeTeam: "Nederland", awayTeam: "Marokko", date: new Date("2026-06-29T21:00:00Z"), stage: "ROUND_OF_32", round: "4" },
  { homeTeam: "Ivoorkust", awayTeam: "Noorwegen", date: new Date("2026-06-30T13:00:00Z"), stage: "ROUND_OF_32", round: "5" },
  { homeTeam: "Frankrijk", awayTeam: "Zweden", date: new Date("2026-06-30T17:00:00Z"), stage: "ROUND_OF_32", round: "6" },
  { homeTeam: "Mexico", awayTeam: "Ecuador", date: new Date("2026-06-30T21:00:00Z"), stage: "ROUND_OF_32", round: "7" },
  { homeTeam: "Engeland", awayTeam: "Congo", date: new Date("2026-07-01T12:00:00Z"), stage: "ROUND_OF_32", round: "8" },
  { homeTeam: "België", awayTeam: "Senegal", date: new Date("2026-07-01T16:00:00Z"), stage: "ROUND_OF_32", round: "9" },
  { homeTeam: "USA", awayTeam: "Bosnië-Herzegovina", date: new Date("2026-07-01T20:00:00Z"), stage: "ROUND_OF_32", round: "10" },
  { homeTeam: "Spanje", awayTeam: "Oostenrijk", date: new Date("2026-07-02T15:00:00Z"), stage: "ROUND_OF_32", round: "11" },
  { homeTeam: "Portugal", awayTeam: "Kroatië", date: new Date("2026-07-02T19:00:00Z"), stage: "ROUND_OF_32", round: "12" },
  { homeTeam: "Zwitserland", awayTeam: "Algerije", date: new Date("2026-07-02T23:00:00Z"), stage: "ROUND_OF_32", round: "13" },
  { homeTeam: "Australië", awayTeam: "Egypte", date: new Date("2026-07-03T14:00:00Z"), stage: "ROUND_OF_32", round: "14" },
  { homeTeam: "Argentinië", awayTeam: "Kaapverdië", date: new Date("2026-07-03T18:00:00Z"), stage: "ROUND_OF_32", round: "15" },
  { homeTeam: "Colombia", awayTeam: "Ghana", date: new Date("2026-07-03T22:30:00Z"), stage: "ROUND_OF_32", round: "16" },

  // Round of 16 (8 wedstrijden)
  { homeTeam: "Canada", awayTeam: "Duitsland", date: new Date("2026-07-04T13:00:00Z"), stage: "QUARTER_FINAL", round: "1" },
  { homeTeam: "Frankrijk", awayTeam: "Ivoorkust", date: new Date("2026-07-04T17:00:00Z"), stage: "QUARTER_FINAL", round: "2" },
  { homeTeam: "Brazilië", awayTeam: "Nederland", date: new Date("2026-07-05T16:00:00Z"), stage: "QUARTER_FINAL", round: "3" },
  { homeTeam: "Mexico", awayTeam: "Engeland", date: new Date("2026-07-05T20:00:00Z"), stage: "QUARTER_FINAL", round: "4" },
  { homeTeam: "Portugal", awayTeam: "Spanje", date: new Date("2026-07-06T15:00:00Z"), stage: "QUARTER_FINAL", round: "5" },
  { homeTeam: "USA", awayTeam: "België", date: new Date("2026-07-06T20:00:00Z"), stage: "QUARTER_FINAL", round: "6" },
  { homeTeam: "Argentinië", awayTeam: "Australië", date: new Date("2026-07-07T12:00:00Z"), stage: "QUARTER_FINAL", round: "7" },
  { homeTeam: "Zwitserland", awayTeam: "Colombia", date: new Date("2026-07-07T16:00:00Z"), stage: "QUARTER_FINAL", round: "8" },

  // Quarterfinals (4 wedstrijden)
  { homeTeam: "QF Winner 1", awayTeam: "QF Winner 2", date: new Date("2026-07-08T15:00:00Z"), stage: "QUARTER_FINAL", round: "9" },
  { homeTeam: "QF Winner 3", awayTeam: "QF Winner 4", date: new Date("2026-07-08T19:00:00Z"), stage: "QUARTER_FINAL", round: "10" },
  { homeTeam: "QF Winner 5", awayTeam: "QF Winner 6", date: new Date("2026-07-09T15:00:00Z"), stage: "QUARTER_FINAL", round: "11" },
  { homeTeam: "QF Winner 7", awayTeam: "QF Winner 8", date: new Date("2026-07-09T19:00:00Z"), stage: "QUARTER_FINAL", round: "12" },

  // Semifinals
  { homeTeam: "Winner QF 1", awayTeam: "Winner QF 2", date: new Date("2026-07-14T15:00:00Z"), stage: "SEMI_FINAL", round: "1" },
  { homeTeam: "Winner QF 3", awayTeam: "Winner QF 4", date: new Date("2026-07-15T15:00:00Z"), stage: "SEMI_FINAL", round: "2" },

  // Final
  { homeTeam: "Winner SF 1", awayTeam: "Winner SF 2", date: new Date("2026-07-19T15:00:00Z"), stage: "FINAL", round: "1" },
];

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete old knockout matches
    await db.match.deleteMany({
      where: {
        OR: [
          { stage: { in: ["RO32", "QF", "SF", "FINAL", "3P", "BRONZE_FINAL"] } },
          { stage: { in: ["ROUND_OF_32", "QUARTER_FINAL", "SEMI_FINAL"] } }
        ]
      }
    });

    // Create new matches
    await db.match.createMany({
      data: knockoutMatches.map(m => ({
        ...m,
        homeFlag: "🏆",
        awayFlag: "🏆",
        status: "SCHEDULED",
      })),
    });

    return NextResponse.json({ message: "✅ Setup complete!", count: knockoutMatches.length });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
