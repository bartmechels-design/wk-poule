import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchWKMatches } from "@/lib/api-football";
import { berekenPunten } from "@/lib/punten";

// Vercel Cron: roept dit endpoint elk uur aan tijdens het WK
// Beveiligd met CRON_SECRET in .env
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.FOOTBALL_API_KEY) {
    return NextResponse.json({ error: "Geen FOOTBALL_API_KEY" }, { status: 400 });
  }

  try {
    const matches = await fetchWKMatches();
    let bijgewerkt = 0;

    for (const m of matches) {
      const bestaand = await db.match.findFirst({
        where: {
          OR: [
            { externalId: m.id },
            { homeTeam: m.homeTeam, awayTeam: m.awayTeam },
          ],
        },
      });

      if (!bestaand) {
        // Nieuwe wedstrijd (bijv. finaleronde) — aanmaken
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
        bijgewerkt++;
        continue;
      }

      const wasFinished = bestaand.status === "FINISHED";

      await db.match.update({
        where: { id: bestaand.id },
        data: {
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          externalId: m.id,
        },
      });

      // Herbereken punten als wedstrijd net gespeeld is
      if (m.status === "FINISHED" && !wasFinished && m.homeScore !== null && m.awayScore !== null) {
        await herberekeningPunten(bestaand.id, m.homeScore, m.awayScore);
      }

      bijgewerkt++;
    }

    return NextResponse.json({
      ok: true,
      bijgewerkt,
      timestamp: new Date().toISOString(),
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
