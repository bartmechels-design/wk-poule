import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const matches = await db.match.groupBy({
  by: ['stage'],
  _count: true,
});

console.log('Matches per stage:');
matches.forEach(m => console.log(`  ${m.stage}: ${m._count}`));

const groupMatches = await db.match.findMany({
  where: { stage: 'GROUP' },
  select: { homeTeam: true, awayTeam: true, homeScore: true, awayScore: true },
});

console.log('\nGroep-matches met scores:');
groupMatches.filter(m => m.homeScore !== null).forEach(m => {
  console.log(`  ${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`);
});

await db.$disconnect();
