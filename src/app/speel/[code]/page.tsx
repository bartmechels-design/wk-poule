import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import NaamKiezer from "./NaamKiezer";
import SpeelHeader from "./SpeelHeader";
import Link from "next/link";

export default async function SpeelPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const groep = await db.group.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      students: {
        orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
        select: { id: true, name: true, totalPoints: true },
      },
    },
  });

  if (!groep) notFound();

  // Tel open wedstrijden (nog te voorspellen)
  const nu = new Date();
  const aantalOpen = await db.match.count({
    where: { status: "SCHEDULED", date: { gt: nu }, externalId: { not: null } },
  });

  // Tel voorspellingen per leerling voor open wedstrijden
  const openMatchIds = await db.match.findMany({
    where: { status: "SCHEDULED", date: { gt: nu }, externalId: { not: null } },
    select: { id: true },
  });
  const openIds = openMatchIds.map((m) => m.id);

  const studentIds = groep.students.map((s) => s.id);
  const voorspelCounts = await db.prediction.groupBy({
    by: ["studentId"],
    where: { studentId: { in: studentIds }, matchId: { in: openIds } },
    _count: { matchId: true },
  });
  const voorspelMap = Object.fromEntries(
    voorspelCounts.map((v) => [v.studentId, v._count.matchId])
  );

  const leerlingen = groep.students.map((s) => ({
    ...s,
    allesIngevuld: aantalOpen === 0 ? true : (voorspelMap[s.id] ?? 0) >= aantalOpen,
  }));

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem" }}>

      <SpeelHeader groepNaam={groep.name} />

      <NaamKiezer groepCode={code} leerlingen={leerlingen} />

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Link href={`/klassement/${groep.code}`}>
          <button className="btn btn-ghost btn-sm">🏆 Klassement</button>
        </Link>
      </div>

      <p className="tekst-dim" style={{ marginTop: "3rem", fontSize: "0.75rem" }}>
        Code: <strong style={{ color: "var(--goud)", fontFamily: "monospace" }}>{groep.code}</strong>
      </p>
    </main>
  );
}
