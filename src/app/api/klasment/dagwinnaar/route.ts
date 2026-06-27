import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupCode = searchParams.get("code");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!groupCode) {
    return NextResponse.json({ error: "code parameter required" }, { status: 400 });
  }

  try {
    // Get group
    const group = await db.group.findUnique({
      where: { code: groupCode.toUpperCase() },
      include: { students: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get knockout matches for this date
    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    const dayMatches = await db.match.findMany({
      where: {
        stage: { not: "GROUP" },
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (dayMatches.length === 0) {
      return NextResponse.json({
        date,
        message: "No knockout matches today",
        todayWinner: null,
        topScorers: [],
      });
    }

    // Calculate points for each student on today's matches
    const studentScores: Record<string, { name: string; points: number }> = {};

    for (const student of group.students) {
      const predictions = await db.prediction.findMany({
        where: {
          studentId: student.id,
          matchId: { in: dayMatches.map((m) => m.id) },
        },
      });

      const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0);
      studentScores[student.id] = { name: student.name, points: totalPoints };
    }

    // Sort by points
    const sorted = Object.values(studentScores)
      .filter((s) => s.points > 0)
      .sort((a, b) => b.points - a.points);

    return NextResponse.json({
      date,
      matchesCount: dayMatches.length,
      todayWinner: sorted[0] || null,
      topScorers: sorted.slice(0, 5),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
