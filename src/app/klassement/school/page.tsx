import { db } from "@/lib/db";
import SchoolKlassementClient from "./SchoolKlassementClient";

export const revalidate = 60;

export default async function SchoolKlassementPage() {
  const leerlingen = await db.student.findMany({
    orderBy: { totalPoints: "desc" },
    take: 100,
    include: { group: { select: { name: true, code: true } } },
  });

  return <SchoolKlassementClient students={leerlingen} />;
}
