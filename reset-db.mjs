import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

console.log('🗑️ Voorspellingen worden verwijderd...');
const predDeleted = await db.prediction.deleteMany({});
console.log(`✅ ${predDeleted.count} voorspellingen verwijderd`);

console.log('🗑️ Alle matches worden verwijderd...');
const deleted = await db.match.deleteMany({});
console.log(`✅ ${deleted.count} matches verwijderd`);

await db.$disconnect();
console.log('✅ Database is leeg!');
