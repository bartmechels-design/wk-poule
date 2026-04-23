import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { studentId, type, value } = await req.json();

  if (!studentId || !type || !value) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const voorspelling = await db.tournamentPrediction.upsert({
    where: { studentId_type: { studentId, type } },
    create: { studentId, type, value },
    update: { value },
  });

  return NextResponse.json(voorspelling);
}
