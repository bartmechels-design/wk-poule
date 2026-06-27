import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const { WK_TEAMS } = await import('./src/lib/wk-data.ts', { assert: { type: 'module' } }).catch(() => ({
  WK_TEAMS: [
    { name: "Mexico", group: "A" },
    { name: "Canada", group: "B" },
    // ... etc
  ]
}));

console.log('🏆 STAP 2: RO32 genereren...');

const groups = {};
const standings = {};

// Group all matches by stage
const groupMatches = await db.match.findMany({
  where: { stage: "GROUP" },
});

console.log(`✅ ${groupMatches.length} GROUP matches gevonden`);

// Calculate standings per group
const groupTeams = {
  A: ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  B: ["Canada", "Bosnia-H.", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

for (const [gKey, teams] of Object.entries(groupTeams)) {
  standings[gKey] = [];
  
  for (const team of teams) {
    const matches = groupMatches.filter(m => m.homeTeam === team || m.awayTeam === team);
    
    let pts = 0, gf = 0, ga = 0;
    matches.forEach(m => {
      if (m.homeScore === null) return;
      if (m.homeTeam === team) {
        gf += m.homeScore;
        ga += m.awayScore;
        if (m.homeScore > m.awayScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      } else {
        gf += m.awayScore;
        ga += m.homeScore;
        if (m.awayScore > m.homeScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      }
    });
    
    standings[gKey].push({ team, pts, gd: gf - ga, gf });
  }
  
  standings[gKey].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  
  console.log(`Groep ${gKey}: 1. ${standings[gKey][0]?.team} (${standings[gKey][0]?.pts}pts), 2. ${standings[gKey][1]?.team} (${standings[gKey][1]?.pts}pts)`);
}

console.log('✅ Stap 2 compleet!');
await db.$disconnect();
