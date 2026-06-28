import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Haal alle RO32 wedstrijden op met resultaten
    const ro32Matches = await db.match.findMany({
      where: { stage: "ROUND_OF_32", status: "FINISHED" },
      orderBy: { date: "asc" },
    });

    if (ro32Matches.length < 16) {
      return NextResponse.json({ message: "Wachten op meer RO32 resultaten", count: ro32Matches.length }, { status: 200 });
    }

    // Bepaal winnaars
    const ro32Winners: string[] = [];
    for (const match of ro32Matches) {
      if (match.homeScore === null || match.awayScore === null) continue;
      const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
      if (winner) ro32Winners.push(winner);
    }

    if (ro32Winners.length < 16) {
      return NextResponse.json({ message: "Niet alle RO32 wedstrijden hebben resultaten", count: ro32Winners.length }, { status: 200 });
    }

    // Update QF wedstrijden (8 matches)
    const qfMatches = await db.match.findMany({
      where: { stage: "QUARTER_FINAL" },
      orderBy: { date: "asc" },
    });

    const qfUpdates = [
      { idx: 0, home: ro32Winners[0], away: ro32Winners[1] },
      { idx: 1, home: ro32Winners[2], away: ro32Winners[3] },
      { idx: 2, home: ro32Winners[4], away: ro32Winners[5] },
      { idx: 3, home: ro32Winners[6], away: ro32Winners[7] },
      { idx: 4, home: ro32Winners[8], away: ro32Winners[9] },
      { idx: 5, home: ro32Winners[10], away: ro32Winners[11] },
      { idx: 6, home: ro32Winners[12], away: ro32Winners[13] },
      { idx: 7, home: ro32Winners[14], away: ro32Winners[15] },
    ];

    for (const update of qfUpdates) {
      if (qfMatches[update.idx]) {
        await db.match.update({
          where: { id: qfMatches[update.idx].id },
          data: {
            homeTeam: update.home,
            awayTeam: update.away,
            homeFlag: "🏆",
            awayFlag: "🏆",
          },
        });
      }
    }

    // Bepaal QF winnaars en update SF
    const qfResultMatches = await db.match.findMany({
      where: { stage: "QUARTER_FINAL", status: "FINISHED" },
      orderBy: { date: "asc" },
    });

    if (qfResultMatches.length >= 4) {
      const qfWinners: string[] = [];
      for (const match of qfResultMatches) {
        if (match.homeScore === null || match.awayScore === null) continue;
        const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
        if (winner) qfWinners.push(winner);
      }

      if (qfWinners.length >= 4) {
        const sfMatches = await db.match.findMany({
          where: { stage: "SEMI_FINAL" },
          orderBy: { date: "asc" },
        });

        const sfUpdates = [
          { idx: 0, home: qfWinners[0], away: qfWinners[1] },
          { idx: 1, home: qfWinners[2], away: qfWinners[3] },
        ];

        for (const update of sfUpdates) {
          if (sfMatches[update.idx]) {
            await db.match.update({
              where: { id: sfMatches[update.idx].id },
              data: {
                homeTeam: update.home,
                awayTeam: update.away,
                homeFlag: "🏆",
                awayFlag: "🏆",
              },
            });
          }
        }

        // Update Final
        const sfResultMatches = await db.match.findMany({
          where: { stage: "SEMI_FINAL", status: "FINISHED" },
          orderBy: { date: "asc" },
        });

        if (sfResultMatches.length >= 2) {
          const sfWinners: string[] = [];
          for (const match of sfResultMatches) {
            if (match.homeScore === null || match.awayScore === null) continue;
            const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
            if (winner) sfWinners.push(winner);
          }

          if (sfWinners.length >= 2) {
            const finalMatch = await db.match.findFirst({
              where: { stage: "FINAL" },
            });

            if (finalMatch) {
              await db.match.update({
                where: { id: finalMatch.id },
                data: {
                  homeTeam: sfWinners[0],
                  awayTeam: sfWinners[1],
                  homeFlag: "🏆",
                  awayFlag: "🏆",
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: "✅ Knockout wedstrijden bijgewerkt!",
      ro32: ro32Winners.length,
      qf: "Updated",
      sf: "Updated",
      final: "Updated",
    });
  } catch (error) {
    console.error("Update knockout error:", error);
    return NextResponse.json({ error: "Failed to update knockout" }, { status: 500 });
  }
}
