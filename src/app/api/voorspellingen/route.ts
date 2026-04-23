import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { studentId, matchId, predictedWinner, predictedHome, predictedAway } =
    await req.json();

  if (!studentId || !matchId || !predictedWinner) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Controleer of wedstrijd nog open is
  const wedstrijd = await db.match.findUnique({ where: { id: matchId } });
  if (!wedstrijd) return NextResponse.json({ error: "Wedstrijd niet gevonden" }, { status: 404 });

  if (wedstrijd.status === "FINISHED") {
    return NextResponse.json(
      { error: "Deze wedstrijd is al gespeeld" },
      { status: 400 }
    );
  }

  if (new Date(wedstrijd.date) < new Date()) {
    return NextResponse.json(
      { error: "De aftrap is al geweest, voorspellen niet meer mogelijk" },
      { status: 400 }
    );
  }

  const voorspelling = await db.prediction.upsert({
    where: { studentId_matchId: { studentId, matchId } },
    create: {
      studentId,
      matchId,
      predictedWinner,
      predictedHome: predictedHome ?? 0,
      predictedAway: predictedAway ?? 0,
    },
    update: {
      predictedWinner,
      predictedHome: predictedHome ?? 0,
      predictedAway: predictedAway ?? 0,
    },
  });

  return NextResponse.json(voorspelling);
}
