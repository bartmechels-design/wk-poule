import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

console.log('🔄 Alle punten worden gereset...');

// Reset student points
const students = await db.student.updateMany({
  data: { totalPoints: 0 }
});
console.log(`✅ ${students.count} leerlingen gereset naar 0 punten`);

// Reset prediction points
const predictions = await db.prediction.updateMany({
  data: { points: 0 }
});
console.log(`✅ ${predictions.count} voorspellingen gereset naar 0 punten`);

// Reset tournament predictions
const tournamentPreds = await db.tournamentPrediction.updateMany({
  data: { points: 0 }
});
console.log(`✅ ${tournamentPreds.count} toernooivoorspellingen gereset naar 0 punten`);

await db.$disconnect();
console.log('✅ Alle punten zijn gereset!');
