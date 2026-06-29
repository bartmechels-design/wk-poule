import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function fix() {
  try {
    // Delete ALL matches first
    const deleted = await db.match.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} matches`);

    // Create fresh matches with CORRECT future dates
    const matches = [
      { homeTeam: "Zuid-Afrika", awayTeam: "Canada", homeFlag: "🇿🇦", awayFlag: "🇨🇦", date: new Date("2026-07-29T18:00:00Z"), stage: "ROUND_OF_32", round: "1", status: "SCHEDULED" },
      { homeTeam: "Brazilië", awayTeam: "Japan", homeFlag: "🇧🇷", awayFlag: "🇯🇵", date: new Date("2026-07-29T13:00:00Z"), stage: "ROUND_OF_32", round: "2", status: "SCHEDULED" },
      { homeTeam: "Duitsland", awayTeam: "Paraguay", homeFlag: "🇩🇪", awayFlag: "🇵🇾", date: new Date("2026-07-29T16:30:00Z"), stage: "ROUND_OF_32", round: "3", status: "SCHEDULED" },
      { homeTeam: "Nederland", awayTeam: "Marokko", homeFlag: "🇳🇱", awayFlag: "🇲🇦", date: new Date("2026-07-29T21:00:00Z"), stage: "ROUND_OF_32", round: "4", status: "SCHEDULED" },
      { homeTeam: "Ivoorkust", awayTeam: "Noorwegen", homeFlag: "🇨🇮", awayFlag: "🇳🇴", date: new Date("2026-07-30T13:00:00Z"), stage: "ROUND_OF_32", round: "5", status: "SCHEDULED" },
      { homeTeam: "Frankrijk", awayTeam: "Zweden", homeFlag: "🇫🇷", awayFlag: "🇸🇪", date: new Date("2026-07-30T17:00:00Z"), stage: "ROUND_OF_32", round: "6", status: "SCHEDULED" },
      { homeTeam: "Mexico", awayTeam: "Ecuador", homeFlag: "🇲🇽", awayFlag: "🇪🇨", date: new Date("2026-07-30T21:00:00Z"), stage: "ROUND_OF_32", round: "7", status: "SCHEDULED" },
      { homeTeam: "Engeland", awayTeam: "Congo", homeFlag: "🇬🇧", awayFlag: "🇨🇩", date: new Date("2026-07-31T12:00:00Z"), stage: "ROUND_OF_32", round: "8", status: "SCHEDULED" },
      { homeTeam: "België", awayTeam: "Senegal", homeFlag: "🇧🇪", awayFlag: "🇸🇳", date: new Date("2026-07-31T16:00:00Z"), stage: "ROUND_OF_32", round: "9", status: "SCHEDULED" },
      { homeTeam: "USA", awayTeam: "Bosnië-Herzegovina", homeFlag: "🇺🇸", awayFlag: "🇧🇦", date: new Date("2026-07-31T20:00:00Z"), stage: "ROUND_OF_32", round: "10", status: "SCHEDULED" },
      { homeTeam: "Spanje", awayTeam: "Oostenrijk", homeFlag: "🇪🇸", awayFlag: "🇦🇹", date: new Date("2026-08-01T15:00:00Z"), stage: "ROUND_OF_32", round: "11", status: "SCHEDULED" },
      { homeTeam: "Portugal", awayTeam: "Kroatië", homeFlag: "🇵🇹", awayFlag: "🇭🇷", date: new Date("2026-08-01T19:00:00Z"), stage: "ROUND_OF_32", round: "12", status: "SCHEDULED" },
      { homeTeam: "Zwitserland", awayTeam: "Algerije", homeFlag: "🇨🇭", awayFlag: "🇩🇿", date: new Date("2026-08-01T23:00:00Z"), stage: "ROUND_OF_32", round: "13", status: "SCHEDULED" },
      { homeTeam: "Australië", awayTeam: "Egypte", homeFlag: "🇦🇺", awayFlag: "🇪🇬", date: new Date("2026-08-02T14:00:00Z"), stage: "ROUND_OF_32", round: "14", status: "SCHEDULED" },
      { homeTeam: "Argentinië", awayTeam: "Kaapverdië", homeFlag: "🇦🇷", awayFlag: "🇨🇻", date: new Date("2026-08-02T18:00:00Z"), stage: "ROUND_OF_32", round: "15", status: "SCHEDULED" },
      { homeTeam: "Colombia", awayTeam: "Ghana", homeFlag: "🇨🇴", awayFlag: "🇬🇭", date: new Date("2026-08-02T22:30:00Z"), stage: "ROUND_OF_32", round: "16", status: "SCHEDULED" },
      { homeTeam: "Canada", awayTeam: "Duitsland", homeFlag: "🇨🇦", awayFlag: "🇩🇪", date: new Date("2026-08-03T13:00:00Z"), stage: "QUARTER_FINAL", round: "1", status: "SCHEDULED" },
      { homeTeam: "Frankrijk", awayTeam: "Ivoorkust", homeFlag: "🇫🇷", awayFlag: "🇨🇮", date: new Date("2026-08-03T17:00:00Z"), stage: "QUARTER_FINAL", round: "2", status: "SCHEDULED" },
      { homeTeam: "Brazilië", awayTeam: "Nederland", homeFlag: "🇧🇷", awayFlag: "🇳🇱", date: new Date("2026-08-04T16:00:00Z"), stage: "QUARTER_FINAL", round: "3", status: "SCHEDULED" },
      { homeTeam: "Mexico", awayTeam: "Engeland", homeFlag: "🇲🇽", awayFlag: "🇬🇧", date: new Date("2026-08-04T20:00:00Z"), stage: "QUARTER_FINAL", round: "4", status: "SCHEDULED" },
      { homeTeam: "Portugal", awayTeam: "Spanje", homeFlag: "🇵🇹", awayFlag: "🇪🇸", date: new Date("2026-08-05T15:00:00Z"), stage: "QUARTER_FINAL", round: "5", status: "SCHEDULED" },
      { homeTeam: "USA", awayTeam: "België", homeFlag: "🇺🇸", awayFlag: "🇧🇪", date: new Date("2026-08-05T20:00:00Z"), stage: "QUARTER_FINAL", round: "6", status: "SCHEDULED" },
      { homeTeam: "Argentinië", awayTeam: "Australië", homeFlag: "🇦🇷", awayFlag: "🇦🇺", date: new Date("2026-08-06T12:00:00Z"), stage: "QUARTER_FINAL", round: "7", status: "SCHEDULED" },
      { homeTeam: "Zwitserland", awayTeam: "Colombia", homeFlag: "🇨🇭", awayFlag: "🇨🇴", date: new Date("2026-08-06T16:00:00Z"), stage: "QUARTER_FINAL", round: "8", status: "SCHEDULED" },
      { homeTeam: "QF Winner 1", awayTeam: "QF Winner 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-07T15:00:00Z"), stage: "QUARTER_FINAL", round: "9", status: "SCHEDULED" },
      { homeTeam: "QF Winner 3", awayTeam: "QF Winner 4", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-07T19:00:00Z"), stage: "QUARTER_FINAL", round: "10", status: "SCHEDULED" },
      { homeTeam: "QF Winner 5", awayTeam: "QF Winner 6", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-08T15:00:00Z"), stage: "QUARTER_FINAL", round: "11", status: "SCHEDULED" },
      { homeTeam: "QF Winner 7", awayTeam: "QF Winner 8", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-08T19:00:00Z"), stage: "QUARTER_FINAL", round: "12", status: "SCHEDULED" },
      { homeTeam: "Winner QF 1", awayTeam: "Winner QF 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-12T15:00:00Z"), stage: "SEMI_FINAL", round: "1", status: "SCHEDULED" },
      { homeTeam: "Winner QF 3", awayTeam: "Winner QF 4", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-13T15:00:00Z"), stage: "SEMI_FINAL", round: "2", status: "SCHEDULED" },
      { homeTeam: "Winner SF 1", awayTeam: "Winner SF 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-16T15:00:00Z"), stage: "FINAL", round: "1", status: "SCHEDULED" },
    ];

    await db.match.createMany({ data: matches });
    console.log(`✅ Created ${matches.length} matches - ALL SCHEDULED and future dates!`);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await db.$disconnect();
  }
}

fix();
