import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Teams per groep
const groups = {
  A: ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  B: ["Canada", "Bosnia-H.", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Argentina", "Austria", "Portugal", "Uzbekistan", "Congo DR", "Senegal", "Norway", "Algeria", "Uruguay", "England", "Ghana", "Croatia", "Colombia", "Panama", "Cape Verde", "Saudi Arabia", "Jordan", "Iraq", "Chile", "Peru"]
};

// Calculate standings per group
for (const [group, teams] of Object.entries(groups)) {
  const matches = await db.match.findMany({
    where: {
      stage: 'GROUP',
      OR: teams.map(team => ({ homeTeam: team }))
        .concat(teams.map(team => ({ awayTeam: team })))
    }
  });

  const stats = {};
  teams.forEach(team => {
    stats[team] = { team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  });

  matches.forEach(m => {
    if (!stats[m.homeTeam] || !stats[m.awayTeam]) return;
    if (m.homeScore === null || m.awayScore === null) return;

    const h = stats[m.homeTeam];
    const a = stats[m.awayTeam];
    h.mp++; a.mp++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      h.w++; h.pts += 3; a.l++;
    } else if (m.homeScore < m.awayScore) {
      a.w++; a.pts += 3; h.l++;
    } else {
      h.d++; h.pts++; a.d++; a.pts++;
    }
  });

  const sorted = Object.values(stats).sort((a, b) => 
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );

  console.log(`\nGroep ${group}:`);
  sorted.forEach((s, i) => {
    const played = s.mp > 0 ? `(${s.mp} matches)` : '(no matches)';
    const qualified = i < 2 ? '✓ through' : '';
    console.log(`  ${i+1}. ${s.team} ${s.pts}pts ${s.gf}-${s.ga} ${played} ${qualified}`);
  });
}

await db.$disconnect();
