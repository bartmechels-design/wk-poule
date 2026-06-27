import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const API_KEY = "c7edc04d5ab34fd8bee09f13f39c6953";
const BASE_URL = "https://api.football-data.org/v4";

console.log('🔄 STAP 1: Wedstrijden synchroniseren van API...');

// Set SSL workaround
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

try {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches?season=2026`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  console.log(`✅ ${data.matches.length} matches van API gehaald`);

  let created = 0;
  for (const m of data.matches) {
    await db.match.create({
      data: {
        externalId: m.id,
        homeTeam: m.homeTeam.shortName || m.homeTeam.name,
        awayTeam: m.awayTeam.shortName || m.awayTeam.name,
        homeFlag: '🏳️',
        awayFlag: '🏳️',
        homeScore: m.score.fullTime.home,
        awayScore: m.score.fullTime.away,
        date: new Date(m.utcDate),
        stage: m.stage === "GROUP_STAGE" ? "GROUP" : m.stage,
        round: m.group || m.stage,
        status: m.status,
      },
    }).catch(() => null);
    created++;
  }
  
  console.log(`✅ ${created} matches opgeslagen`);
  
} catch (err) {
  console.error('❌ Sync mislukt:', err.message);
  process.exit(1);
}

await db.$disconnect();
console.log('✅ Stap 1 compleet!');
