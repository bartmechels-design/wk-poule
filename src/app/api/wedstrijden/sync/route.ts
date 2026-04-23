import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fetchWKMatches } from "@/lib/api-football";
import { berekenPunten } from "@/lib/punten";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  if (!process.env.FOOTBALL_API_KEY) {
    return NextResponse.json(
      { error: "Geen API-sleutel geconfigureerd. Voeg FOOTBALL_API_KEY toe aan .env" },
      { status: 400 }
    );
  }

  try {
    const matches = await fetchWKMatches();

    let nieuw = 0;
    let bijgewerkt = 0;

    for (const m of matches) {
      const bestaand = await db.match.findUnique({ where: { externalId: m.id } });

      if (!bestaand) {
        await db.match.create({
          data: {
            externalId: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeFlag: m.homeFlag,
            awayFlag: m.awayFlag,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            date: m.date,
            stage: m.stage,
            round: m.round,
            status: m.status,
          },
        });
        nieuw++;
      } else {
        await db.match.update({
          where: { id: bestaand.id },
          data: {
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            status: m.status,
          },
        });

        // Als wedstrijd gespeeld is, herbereken punten
        if (m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null) {
          await herberekeningPunten(bestaand.id, m.homeScore, m.awayScore);
        }

        bijgewerkt++;
      }
    }

    return NextResponse.json({
      message: `${nieuw} nieuwe wedstrijden toegevoegd, ${bijgewerkt} wedstrijden bijgewerkt`,
      nieuw,
      bijgewerkt,
    });
  } catch (err: unknown) {
    const bericht = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: bericht }, { status: 500 });
  }
}

async function herberekeningPunten(matchId: string, homeScore: number, awayScore: number) {
  const voorspellingen = await db.prediction.findMany({ where: { matchId } });

  for (const v of voorspellingen) {
    const { total, breakdown } = berekenPunten(
      v.predictedHome,
      v.predictedAway,
      v.predictedWinner,
      homeScore,
      awayScore
    );

    await db.prediction.update({
      where: { id: v.id },
      data: { points: total, pointsBreakdown: JSON.stringify(breakdown) },
    });
  }

  // Herbereken totaal voor elke leerling die deze wedstrijd heeft
  const studentIds = [...new Set(voorspellingen.map((v) => v.studentId))];
  for (const studentId of studentIds) {
    const alleVoorspellingen = await db.prediction.findMany({
      where: { studentId },
      select: { points: true },
    });
    const wkBonus = await db.tournamentPrediction.findMany({
      where: { studentId },
      select: { points: true },
    });

    const totaal =
      alleVoorspellingen.reduce((s, v) => s + v.points, 0) +
      wkBonus.reduce((s, v) => s + v.points, 0);

    await db.student.update({
      where: { id: studentId },
      data: { totalPoints: totaal },
    });
  }
}
