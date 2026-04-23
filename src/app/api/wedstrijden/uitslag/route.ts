import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { berekenPunten } from "@/lib/punten";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { matchId, homeScore, awayScore } = await req.json();
  if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const wedstrijd = await db.match.update({
    where: { id: matchId },
    data: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      status: "FINISHED",
    },
  });

  // Herbereken punten voor alle voorspellingen van deze wedstrijd
  const voorspellingen = await db.prediction.findMany({ where: { matchId } });

  for (const v of voorspellingen) {
    const { total, breakdown } = berekenPunten(
      v.predictedHome, v.predictedAway, v.predictedWinner,
      Number(homeScore), Number(awayScore)
    );
    await db.prediction.update({
      where: { id: v.id },
      data: { points: total, pointsBreakdown: JSON.stringify(breakdown) },
    });
  }

  // Update totaalpunten per leerling
  const studentIds = [...new Set(voorspellingen.map((v) => v.studentId))];
  for (const studentId of studentIds) {
    const alle = await db.prediction.findMany({ where: { studentId }, select: { points: true } });
    const bonus = await db.tournamentPrediction.findMany({ where: { studentId }, select: { points: true } });
    const totaal = alle.reduce((s, v) => s + v.points, 0) + bonus.reduce((s, v) => s + v.points, 0);
    await db.student.update({ where: { id: studentId }, data: { totalPoints: totaal } });
  }

  return NextResponse.json({ ok: true, wedstrijd: wedstrijd.homeTeam + " - " + wedstrijd.awayTeam });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { matchId } = await req.json();
  if (!matchId) return NextResponse.json({ error: "matchId ontbreekt" }, { status: 400 });

  // Reset wedstrijd naar gepland
  await db.match.update({
    where: { id: matchId },
    data: { homeScore: null, awayScore: null, status: "SCHEDULED" },
  });

  // Reset punten van alle voorspellingen voor deze wedstrijd
  const voorspellingen = await db.prediction.findMany({ where: { matchId } });
  for (const v of voorspellingen) {
    await db.prediction.update({ where: { id: v.id }, data: { points: 0, pointsBreakdown: null } });
  }

  // Herbereken totaalpunten per leerling
  const studentIds = [...new Set(voorspellingen.map((v) => v.studentId))];
  for (const studentId of studentIds) {
    const alle = await db.prediction.findMany({ where: { studentId }, select: { points: true } });
    const bonus = await db.tournamentPrediction.findMany({ where: { studentId }, select: { points: true } });
    const totaal = alle.reduce((s, v) => s + v.points, 0) + bonus.reduce((s, v) => s + v.points, 0);
    await db.student.update({ where: { id: studentId }, data: { totalPoints: totaal } });
  }

  return NextResponse.json({ ok: true });
}
