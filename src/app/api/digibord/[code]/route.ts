import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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

  if (!groep) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Winnaar van de dag: meeste punten bij matches in de laatste 48u
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
    const puntenPerStudent: Record<string, number> = {};
    for (const v of voorspellingen) {
      puntenPerStudent[v.studentId] = (puntenPerStudent[v.studentId] ?? 0) + v.points;
    }
    const top = Object.entries(puntenPerStudent).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0) {
      const student = groep.students.find((s) => s.id === top[0]);
      if (student) winnaarVanDag = { name: student.name, punten: top[1] };
    }
  }

  const volgendeWedstrijd = await db.match.findFirst({
    where: { status: "SCHEDULED", date: { gt: new Date() } },
    orderBy: { date: "asc" },
  });

  const laasteWedstrijd = await db.match.findFirst({
    where: { status: "FINISHED" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    leerlingen: groep.students,
    winnaarVanDag,
    volgendeWedstrijd: volgendeWedstrijd ? {
      homeTeam: volgendeWedstrijd.homeTeam, awayTeam: volgendeWedstrijd.awayTeam,
      homeFlag: volgendeWedstrijd.homeFlag, awayFlag: volgendeWedstrijd.awayFlag,
      date: volgendeWedstrijd.date.toISOString(),
    } : null,
    laasteWedstrijd: laasteWedstrijd?.homeScore !== null ? {
      homeTeam: laasteWedstrijd!.homeTeam, awayTeam: laasteWedstrijd!.awayTeam,
      homeFlag: laasteWedstrijd!.homeFlag, awayFlag: laasteWedstrijd!.awayFlag,
      homeScore: laasteWedstrijd!.homeScore, awayScore: laasteWedstrijd!.awayScore,
    } : null,
  });
}
