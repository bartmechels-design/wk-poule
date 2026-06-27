import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Simulate the generate function
const WK_TEAMS = [
  { name: "Mexico", flag: "🇲🇽", code: "MEX", group: "A" },
  { name: "South Africa", flag: "🇿🇦", code: "RSA", group: "A" },
  { name: "Korea Republic", flag: "🇰🇷", code: "KOR", group: "A" },
  { name: "Czechia", flag: "🇨🇿", code: "CZE", group: "A" },
  // ... (rest would be added in real scenario)
];

async function getGroupStandings() {
  const groups = {
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

  const standings = {};

  for (const [groupKey, teams] of Object.entries(groups)) {
    standings[groupKey] = [];

    for (const team of teams) {
      const homeMatches = await db.match.findMany({
        where: { stage: "GROUP", homeTeam: team },
        select: { homeScore: true, awayScore: true },
      });

      const awayMatches = await db.match.findMany({
        where: { stage: "GROUP", awayTeam: team },
        select: { homeScore: true, awayScore: true },
      });

      let pts = 0, gf = 0, ga = 0;

      homeMatches.forEach(m => {
        if (m.homeScore === null) return;
        gf += m.homeScore; ga += m.awayScore;
        if (m.homeScore > m.awayScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      });

      awayMatches.forEach(m => {
        if (m.homeScore === null) return;
        gf += m.awayScore; ga += m.homeScore;
        if (m.awayScore > m.homeScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      });

      standings[groupKey].push({ team, pts, gd: gf - ga, gf });
    }

    standings[groupKey].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }

  return standings;
}

const standings = await getGroupStandings();

// Show RO32 pairings
console.log('Round of 32 pairings:');
console.log('='.repeat(50));

const pairings = [
  { m: 1, g1: 'A', p1: 1, g2: 'B', p2: 2 },
  { m: 2, g1: 'A', p1: 2, g2: 'B', p2: 1 },
  { m: 3, g1: 'C', p1: 1, g2: 'D', p2: 2 },
  { m: 4, g1: 'C', p1: 2, g2: 'D', p2: 1 },
  { m: 5, g1: 'E', p1: 1, g2: 'F', p2: 2 },
  { m: 6, g1: 'E', p1: 2, g2: 'F', p2: 1 },
  { m: 7, g1: 'G', p1: 1, g2: 'H', p2: 2 },
  { m: 8, g1: 'G', p1: 2, g2: 'H', p2: 1 },
  { m: 9, g1: 'I', p1: 1, g2: 'J', p2: 2 },
  { m: 10, g1: 'I', p1: 2, g2: 'J', p2: 1 },
  { m: 11, g1: 'K', p1: 1, g2: 'L', p2: 2 },
  { m: 12, g1: 'K', p1: 2, g2: 'L', p2: 1 },
];

pairings.forEach(p => {
  const t1 = standings[p.g1]?.[p.p1 - 1]?.team || '?';
  const t2 = standings[p.g2]?.[p.p2 - 1]?.team || '?';
  console.log(`Match ${p.m}: ${t1} (${p.g1}${p.p1}) vs ${t2} (${p.g2}${p.p2})`);
});

console.log('\n3de plaats teams (voor Best 4 van 3de plaats):');
console.log('='.repeat(50));
const thirdPlaced = Object.entries(standings)
  .map(([g, s]) => ({ group: g, team: s[2] }))
  .filter(x => x.team)
  .sort((a, b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd)
  .slice(0, 4);

thirdPlaced.forEach((t, i) => {
  console.log(`${i+1}. ${t.team.team} (${t.group}): ${t.team.pts}pts (${t.team.gf-(-t.team.gd)}−${t.team.gf + t.team.gd - (t.team.gf-(-t.team.gd))})`);
});

await db.$disconnect();
