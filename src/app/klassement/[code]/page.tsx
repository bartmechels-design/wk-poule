import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import KlassementClient from "./KlassementClient";

export const revalidate = 60;

export default async function KlassementPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const [groep, wedstrijden] = await Promise.all([
    db.group.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        students: {
          orderBy: { totalPoints: "desc" },
          select: { id: true, name: true, totalPoints: true, _count: { select: { predictions: true } } },
        },
      },
    }),
    db.match.findMany({
      where: {
        homeTeam: { not: null },
        awayTeam: { not: null },
        OR: [
          { externalId: { not: null } },  // Van API
          { stage: { in: ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"] } }  // Gegenereerde knockout
        ]
      },
      orderBy: { date: "asc" },
      select: { id: true, homeTeam: true, awayTeam: true, homeScore: true, awayScore: true, stage: true, round: true, status: true, date: true },
    }),
  ]);

  if (!groep) notFound();

  return (
    <KlassementClient
      groepNaam={groep.name}
      groepCode={groep.code}
      groepId={groep.id}
      students={groep.students}
      wedstrijden={wedstrijden.map(w => ({ ...w, date: w.date.toISOString() }))}
    />
  );
}
