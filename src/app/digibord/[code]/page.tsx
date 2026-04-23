import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import DigibordClient from "./DigibordClient";

export default async function DigibordPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const groep = await db.group.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      students: {
        orderBy: { totalPoints: "desc" },
        select: { id: true, name: true, totalPoints: true },
      },
    },
  });

  if (!groep) notFound();

  const volgendeWedstrijd = await db.match.findFirst({
    where: { status: "SCHEDULED", date: { gt: new Date() } },
    orderBy: { date: "asc" },
  });

  const laasteWedstrijd = await db.match.findFirst({
    where: { status: "FINISHED" },
    orderBy: { date: "desc" },
  });

  // Winnaar van de dag
  const gisteren = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recenteMatches = await db.match.findMany({
    where: { status: "FINISHED", date: { gte: gisteren } },
    select: { id: true },
  });
  let winnaarVanDag: { name: string; punten: number } | null = null;
  if (recenteMatches.length > 0) {
    const matchIds = recenteMatches.map((m) => m.id);
    const studentIds = groep.students.map((s) => s.id);
    const voorspellingen = await db.prediction.findMany({
      where: { matchId: { in: matchIds }, studentId: { in: studentIds } },
      select: { studentId: true, points: true },
    });
    const puntenMap: Record<string, number> = {};
    for (const v of voorspellingen) puntenMap[v.studentId] = (puntenMap[v.studentId] ?? 0) + v.points;
    const top = Object.entries(puntenMap).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0) {
      const s = groep.students.find((s) => s.id === top[0]);
      if (s) winnaarVanDag = { name: s.name, punten: top[1] };
    }
  }

  return (
    <DigibordClient
      groepNaam={groep.name}
      groepCode={groep.code}
      groepId={groep.id}
      leerlingen={groep.students}
      winnaarVanDag={winnaarVanDag}
      volgendeWedstrijd={volgendeWedstrijd ? {
        homeTeam: volgendeWedstrijd.homeTeam, awayTeam: volgendeWedstrijd.awayTeam,
        date: volgendeWedstrijd.date.toISOString(),
      } : null}
      laasteWedstrijd={laasteWedstrijd && laasteWedstrijd.homeScore !== null ? {
        homeTeam: laasteWedstrijd.homeTeam, awayTeam: laasteWedstrijd.awayTeam,
        homeScore: laasteWedstrijd.homeScore!, awayScore: laasteWedstrijd.awayScore!,
      } : null}
    />
  );
}
