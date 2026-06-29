import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const knockoutMatches = [
  // Round of 32 (16 wedstrijden) - ECHTE WK 2026 - NEDERLANDSE TEAMNAMEN!
  { homeTeam: "Zuid-Afrika", awayTeam: "Canada", homeFlag: "🇿🇦", awayFlag: "🇨🇦", date: new Date("2026-07-29T18:00:00Z"), stage: "ROUND_OF_32", round: "1" },
  { homeTeam: "Brazilië", awayTeam: "Japan", homeFlag: "🇧🇷", awayFlag: "🇯🇵", date: new Date("2026-07-29T13:00:00Z"), stage: "ROUND_OF_32", round: "2" },
  { homeTeam: "Duitsland", awayTeam: "Paraguay", homeFlag: "🇩🇪", awayFlag: "🇵🇾", date: new Date("2026-07-29T16:30:00Z"), stage: "ROUND_OF_32", round: "3" },
  { homeTeam: "Nederland", awayTeam: "Marokko", homeFlag: "🇳🇱", awayFlag: "🇲🇦", date: new Date("2026-07-29T21:00:00Z"), stage: "ROUND_OF_32", round: "4" },
  { homeTeam: "Ivoorkust", awayTeam: "Noorwegen", homeFlag: "🇨🇮", awayFlag: "🇳🇴", date: new Date("2026-07-30T13:00:00Z"), stage: "ROUND_OF_32", round: "5" },
  { homeTeam: "Frankrijk", awayTeam: "Zweden", homeFlag: "🇫🇷", awayFlag: "🇸🇪", date: new Date("2026-07-30T17:00:00Z"), stage: "ROUND_OF_32", round: "6" },
  { homeTeam: "Mexico", awayTeam: "Ecuador", homeFlag: "🇲🇽", awayFlag: "🇪🇨", date: new Date("2026-07-30T21:00:00Z"), stage: "ROUND_OF_32", round: "7" },
  { homeTeam: "Engeland", awayTeam: "Congo", homeFlag: "🇬🇧", awayFlag: "🇨🇩", date: new Date("2026-07-31T12:00:00Z"), stage: "ROUND_OF_32", round: "8" },
  { homeTeam: "België", awayTeam: "Senegal", homeFlag: "🇧🇪", awayFlag: "🇸🇳", date: new Date("2026-07-31T16:00:00Z"), stage: "ROUND_OF_32", round: "9" },
  { homeTeam: "USA", awayTeam: "Bosnië-Herzegovina", homeFlag: "🇺🇸", awayFlag: "🇧🇦", date: new Date("2026-07-31T20:00:00Z"), stage: "ROUND_OF_32", round: "10" },
  { homeTeam: "Spanje", awayTeam: "Oostenrijk", homeFlag: "🇪🇸", awayFlag: "🇦🇹", date: new Date("2026-08-01T15:00:00Z"), stage: "ROUND_OF_32", round: "11" },
  { homeTeam: "Portugal", awayTeam: "Kroatië", homeFlag: "🇵🇹", awayFlag: "🇭🇷", date: new Date("2026-08-01T19:00:00Z"), stage: "ROUND_OF_32", round: "12" },
  { homeTeam: "Zwitserland", awayTeam: "Algerije", homeFlag: "🇨🇭", awayFlag: "🇩🇿", date: new Date("2026-08-01T23:00:00Z"), stage: "ROUND_OF_32", round: "13" },
  { homeTeam: "Australië", awayTeam: "Egypte", homeFlag: "🇦🇺", awayFlag: "🇪🇬", date: new Date("2026-08-02T14:00:00Z"), stage: "ROUND_OF_32", round: "14" },
  { homeTeam: "Argentinië", awayTeam: "Kaapverdië", homeFlag: "🇦🇷", awayFlag: "🇨🇻", date: new Date("2026-08-02T18:00:00Z"), stage: "ROUND_OF_32", round: "15" },
  { homeTeam: "Colombia", awayTeam: "Ghana", homeFlag: "🇨🇴", awayFlag: "🇬🇭", date: new Date("2026-08-02T22:30:00Z"), stage: "ROUND_OF_32", round: "16" },

  // Round of 16 / Quarterfinals (8 wedstrijden) - ECHTE WK 2026
  { homeTeam: "Canada", awayTeam: "Duitsland", homeFlag: "🇨🇦", awayFlag: "🇩🇪", date: new Date("2026-08-03T13:00:00Z"), stage: "QUARTER_FINAL", round: "1" },
  { homeTeam: "Frankrijk", awayTeam: "Ivoorkust", homeFlag: "🇫🇷", awayFlag: "🇨🇮", date: new Date("2026-08-03T17:00:00Z"), stage: "QUARTER_FINAL", round: "2" },
  { homeTeam: "Brazilië", awayTeam: "Nederland", homeFlag: "🇧🇷", awayFlag: "🇳🇱", date: new Date("2026-08-04T16:00:00Z"), stage: "QUARTER_FINAL", round: "3" },
  { homeTeam: "Mexico", awayTeam: "Engeland", homeFlag: "🇲🇽", awayFlag: "🇬🇧", date: new Date("2026-08-04T20:00:00Z"), stage: "QUARTER_FINAL", round: "4" },
  { homeTeam: "Portugal", awayTeam: "Spanje", homeFlag: "🇵🇹", awayFlag: "🇪🇸", date: new Date("2026-08-05T15:00:00Z"), stage: "QUARTER_FINAL", round: "5" },
  { homeTeam: "USA", awayTeam: "België", homeFlag: "🇺🇸", awayFlag: "🇧🇪", date: new Date("2026-08-05T20:00:00Z"), stage: "QUARTER_FINAL", round: "6" },
  { homeTeam: "Argentinië", awayTeam: "Australië", homeFlag: "🇦🇷", awayFlag: "🇦🇺", date: new Date("2026-08-06T12:00:00Z"), stage: "QUARTER_FINAL", round: "7" },
  { homeTeam: "Zwitserland", awayTeam: "Colombia", homeFlag: "🇨🇭", awayFlag: "🇨🇴", date: new Date("2026-08-06T16:00:00Z"), stage: "QUARTER_FINAL", round: "8" },

  // Quarterfinals (4 wedstrijden) - 8-13 juli
  { homeTeam: "QF Winner 1", awayTeam: "QF Winner 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-07T15:00:00Z"), stage: "QUARTER_FINAL", round: "9" },
  { homeTeam: "QF Winner 3", awayTeam: "QF Winner 4", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-07T19:00:00Z"), stage: "QUARTER_FINAL", round: "10" },
  { homeTeam: "QF Winner 5", awayTeam: "QF Winner 6", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-08T15:00:00Z"), stage: "QUARTER_FINAL", round: "11" },
  { homeTeam: "QF Winner 7", awayTeam: "QF Winner 8", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-08T19:00:00Z"), stage: "QUARTER_FINAL", round: "12" },

  // Semifinals (2 wedstrijden) - ECHTE WK 2026
  { homeTeam: "Winner QF 1", awayTeam: "Winner QF 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-12T15:00:00Z"), stage: "SEMI_FINAL", round: "1" },
  { homeTeam: "Winner QF 3", awayTeam: "Winner QF 4", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-13T15:00:00Z"), stage: "SEMI_FINAL", round: "2" },

  // Final
  { homeTeam: "Winner SF 1", awayTeam: "Winner SF 2", homeFlag: "🏆", awayFlag: "🏆", date: new Date("2026-08-16T15:00:00Z"), stage: "FINAL", round: "1" },
];

async function setup() {
  try {
    console.log("🚀 Setting up database...");

    // 1. Create teacher account
    const passwordHash = await bcrypt.hash("Scooby76", 10);
    const teacher = await db.teacher.upsert({
      where: { email: "bart.mechels@skoa.aw" },
      update: { passwordHash },
      create: {
        email: "bart.mechels@skoa.aw",
        name: "Bart Mechels",
        passwordHash,
      },
    });
    console.log("✅ Teacher account:", teacher.email);

    // 2. Create knockout matches
    // First delete ALL old knockout matches (both old and new format)
    await db.match.deleteMany({
      where: {
        OR: [
          { stage: { in: ["RO32", "QF", "SF", "FINAL", "3P", "BRONZE_FINAL"] } },
          { stage: { in: ["ROUND_OF_32", "QUARTER_FINAL", "SEMI_FINAL"] } }
        ]
      }
    });

    // Then create new ones
    await db.match.createMany({
      data: knockoutMatches,
    });
    console.log("✅ Created", knockoutMatches.length, "knockout matches");

    console.log("\n📋 Summary:");
    console.log("- Teacher email: bartmechels@gmail.com");
    console.log("- Temporary password: temporary123");
    console.log("- Knockout matches ready for predictions");
    console.log("- Ready for student group setup!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await db.$disconnect();
  }
}

setup();
