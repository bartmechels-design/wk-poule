import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const ro32 = await db.match.findMany({
  where: { stage: 'ROUND_OF_32' }
});

console.log(`RO32 in database: ${ro32.length} matches`);
ro32.forEach(m => {
  console.log(`  ${m.round}: ${m.homeTeam || '?'} vs ${m.awayTeam || '?'}`);
});

const ro16 = await db.match.findMany({
  where: { stage: 'ROUND_OF_16' }
});

console.log(`\nROUND_OF_16 in database: ${ro16.length} matches`);

const other = await db.match.findMany({
  where: { stage: { notIn: ['GROUP', 'ROUND_OF_32', 'ROUND_OF_16'] } }
});

console.log(`\nAnders stages: ${other.length} matches`);
other.forEach(m => {
  console.log(`  ${m.stage}: ${m.homeTeam} vs ${m.awayTeam}`);
});

await db.$disconnect();
