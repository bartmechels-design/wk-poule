import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const stages = await db.match.groupBy({
  by: ['stage'],
  _count: true
});

console.log('Alle stages in database:');
stages.forEach(s => {
  console.log(`  ${s.stage}: ${s._count}`);
});

console.log('\nLAST_32 matches:');
const last32 = await db.match.findMany({
  where: { stage: 'LAST_32' }
});
last32.forEach(m => {
  console.log(`  ${m.id}: ${m.homeTeam} vs ${m.awayTeam}`);
});

console.log('\nROUND_OF_32 matches:');
const ro32 = await db.match.findMany({
  where: { stage: 'ROUND_OF_32' },
  take: 5
});
console.log(`  (${ro32.length} totaal, eerste 5:)`);
ro32.forEach(m => {
  console.log(`  ${m.round}: ${m.homeTeam} vs ${m.awayTeam}`);
});

await db.$disconnect();
