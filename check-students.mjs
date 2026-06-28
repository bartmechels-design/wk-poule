import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const students = await db.student.count();
const groups = await db.group.count();
const teachers = await db.teacher.count();

console.log(`👨‍🎓 Leerlingen: ${students}`);
console.log(`👥 Groepen: ${groups}`);
console.log(`👨‍🏫 Teachers: ${teachers}`);

await db.$disconnect();
