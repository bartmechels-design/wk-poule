import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const matches = await db.match.findMany({
  where: { stage: 'GROUP' },
  select: { homeTeam: true, awayTeam: true }
});

const teamsInGroups = new Set();
matches.forEach(m => {
  teamsInGroups.add(m.homeTeam);
  teamsInGroups.add(m.awayTeam);
});

console.log(`Totaal teams die matches gespeeld hebben: ${teamsInGroups.size}`);
console.log('Teams:', Array.from(teamsInGroups).sort());

// Check wk-data
import { WK_TEAMS } from './src/lib/wk-data.js';

const groups = {};
WK_TEAMS.forEach(t => {
  if (!groups[t.group]) groups[t.group] = [];
  groups[t.group].push(t.name);
});

console.log('\nGroepen in wk-data:');
Object.entries(groups).forEach(([g, teams]) => {
  console.log(`Groep ${g}: ${teams.length} teams - ${teams.slice(0, 2).join(', ')}...`);
});

await db.$disconnect();
