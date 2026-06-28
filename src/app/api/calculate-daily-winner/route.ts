import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Haal alle groepen op
    const groups = await db.group.findMany();

    for (const group of groups) {
      // Bepaal gister (UTC)
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const tomorrow = new Date(yesterday);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      // Haal alle voorspellingen van gisteren op
      const predictions = await db.prediction.findMany({
        where: {
          student: { groupId: group.id },
          createdAt: { gte: yesterday, lt: tomorrow },
        },
        include: { student: true },
      });

      if (predictions.length === 0) continue;

      // Bereken punten per leerling
      const studentPoints: Record<string, { name: string; points: number }> = {};

      for (const pred of predictions) {
        if (!studentPoints[pred.studentId]) {
          studentPoints[pred.studentId] = { name: pred.student.name, points: 0 };
        }
        studentPoints[pred.studentId].points += pred.points;
      }

      // Vind winnaar
      let winner: { id: string; name: string; points: number } | null = null;
      for (const [id, data] of Object.entries(studentPoints)) {
        if (!winner || data.points > winner.points) {
          winner = { id, name: data.name, points: data.points };
        }
      }

      if (winner) {
        await db.group.update({
          where: { id: group.id },
          data: {
            dailyWinnerId: winner.id,
            dailyWinnerName: winner.name,
            dailyWinnerDate: yesterday,
          },
        });
      }
    }

    return NextResponse.json({ message: "✅ Dagwinnaars berekend!" });
  } catch (error) {
    console.error("Daily winner error:", error);
    return NextResponse.json({ error: "Failed to calculate daily winner" }, { status: 500 });
  }
}
