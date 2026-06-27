import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import VoorspelForm from "./VoorspelForm";
import VoorspelHeader from "./VoorspelHeader";
import KlassementLink from "./KlassementLink";

export default async function VoorspelPage({
  params,
}: {
  params: Promise<{ code: string; studentId: string }>;
}) {
  const { code, studentId } = await params;

  const leerling = await db.student.findUnique({
    where: { id: studentId },
    include: { group: true },
  });

  if (!leerling || leerling.group.code !== code.toUpperCase()) notFound();

  const nu = new Date();

  const wedstrijden = await db.match.findMany({
    where: {
      homeTeam: { not: null },
      awayTeam: { not: null },
      OR: [
        { externalId: { not: null } },  // Van API
        { stage: { in: ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"] } }  // Gegenereerde knockout
      ]
    },
    orderBy: { date: "asc" }
  });

  const voorspellingen = await db.prediction.findMany({
    where: { studentId },
    select: { matchId: true, predictedWinner: true, predictedHome: true, predictedAway: true, points: true },
  });

  const wkWinnaar = await db.tournamentPrediction.findUnique({
    where: { studentId_type: { studentId, type: "WK_WINNER" } },
  });

  const voorspelMap = Object.fromEntries(voorspellingen.map((v) => [v.matchId, v]));
  const openWedstrijden = wedstrijden.filter((w) => w.status === "SCHEDULED" && new Date(w.date) > nu);
  const gespeeldeWedstrijden = wedstrijden.filter((w) => w.status === "FINISHED");
  const aantalVoorspeld = voorspellingen.length;

  return (
    <main style={{ minHeight: "100vh", padding: "0" }}>
      <VoorspelHeader
        code={code}
        name={leerling.name}
        groupName={leerling.group.name}
        totalPoints={leerling.totalPoints}
        aantalVoorspeld={aantalVoorspeld}
        totaal={wedstrijden.length}
      />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1rem 1.5rem" }}>
        <VoorspelForm
          leerlingId={studentId}
          leerlingNaam={leerling.name}
          wedstrijden={wedstrijden.map((w) => ({
            id: w.id, homeTeam: w.homeTeam, awayTeam: w.awayTeam,
            homeFlag: w.homeFlag, awayFlag: w.awayFlag,
            date: w.date.toISOString(), stage: w.stage, round: w.round,
            status: w.status, homeScore: w.homeScore, awayScore: w.awayScore,
          }))}
          openWedstrijdenIds={openWedstrijden.map((w) => w.id)}
          voorspelMap={voorspelMap}
          wkWinnaar={wkWinnaar?.value ?? null}
          gespeeldeWedstrijden={gespeeldeWedstrijden.map((w) => ({
            id: w.id, homeTeam: w.homeTeam, awayTeam: w.awayTeam,
            homeFlag: w.homeFlag, awayFlag: w.awayFlag,
            homeScore: w.homeScore!, awayScore: w.awayScore!,
          }))}
        />
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <KlassementLink code={code} />
        </div>
      </div>
    </main>
  );
}
