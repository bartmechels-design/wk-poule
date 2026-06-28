import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LeerlingenBeheer from "./LeerlingenBeheer";
import WedstrijdenSync from "./WedstrijdenSync";
import UitslagenBeheer from "./UitslagenBeheer";
import ResetKnop from "./ResetKnop";
import { DashboardBtn } from "@/components/NavBar";

export default async function GroepBeheerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const groep = await db.group.findUnique({
    where: { id },
    include: {
      students: {
        include: { _count: { select: { predictions: true } } },
        orderBy: { name: "asc" },
      },
      teachers: true,
    },
  });

  if (!groep) notFound();

  const isOwner = groep.teacherId === session.user.id;
  const isCollaborator = groep.teachers.some(t => t.teacherId === session.user.id);

  if (!isOwner && !isCollaborator) notFound();

  const aantalWedstrijden = await db.match.count();
  const wedstrijden = await db.match.findMany({
    where: {
      homeTeam: { not: null },
      awayTeam: { not: null },
      OR: [
        { externalId: { not: null } },  // Van API
        { stage: { in: ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"] } }  // Gegenereerde knockout
      ]
    },
    orderBy: { date: "asc" },
    select: { id: true, homeTeam: true, awayTeam: true, homeScore: true, awayScore: true, status: true, date: true, round: true, stage: true },
  });

  return (
    <main style={{ minHeight: "100vh", padding: "0" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "1.4rem", lineHeight: 1 }}>←</Link>
          <span style={{ fontSize: "1.3rem" }}>⚽</span>
          <span style={{ fontWeight: 900, color: "var(--goud)", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>WK Poule 2026</span>
        </div>
        <DashboardBtn />
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1rem" }}>

        {/* Groep header */}
        <div className="anim-fade" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>{groep.name}</h1>
              <p className="tekst-dim" style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                {groep.students.length} leerling{groep.students.length !== 1 ? "en" : ""} ingeschreven
              </p>
            </div>
            <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px", padding: "0.5rem 1.2rem", fontFamily: "monospace", fontWeight: 900, fontSize: "1.6rem", color: "var(--goud)", letterSpacing: "0.15em" }}>
              {groep.code}
            </div>
          </div>
        </div>

        {/* Deellink card */}
        <div className="kaart anim-in" style={{ marginBottom: "1.5rem", background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <span style={{ fontSize: "1.5rem" }}>📤</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--goud)", marginBottom: "0.4rem" }}>Delen met leerlingen</h2>
              <p className="tekst-dim" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                Leerlingen gaan naar de site en voeren deze code in:
              </p>
              <div style={{ fontFamily: "monospace", fontSize: "2.5rem", fontWeight: 900, letterSpacing: "0.2em", color: "var(--goud)", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.75rem" }}>
                {groep.code}
              </div>
            </div>
          </div>
        </div>

        {/* Leerlingen */}
        <div className="kaart-dark anim-in" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            👨‍🎓 Leerlingen beheren <span className="tekst-dim" style={{ fontWeight: 400 }}>({groep.students.length})</span>
          </h2>
          <LeerlingenBeheer groepId={groep.id} leerlingen={groep.students} />
        </div>

        {/* Snelle links */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <Link href={`/klassement/${groep.code}`}><button className="btn btn-ghost btn-sm">🏆 Klassement</button></Link>
          <Link href={`/digibord/${groep.code}`} target="_blank"><button className="btn btn-ghost btn-sm">📺 Digibord</button></Link>
          <Link href={`/speel/${groep.code}`} target="_blank"><button className="btn btn-ghost btn-sm">👀 Leerling-view</button></Link>
          <ResetKnop groepId={groep.id} />
        </div>

        {/* Uitslagen handmatig invoeren */}
        <div className="kaart-dark anim-in" style={{ marginBottom: "1.5rem", animationDelay: "0.1s" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            ⚽ Uitslagen invoeren
          </h2>
          <UitslagenBeheer wedstrijden={wedstrijden.filter((w) => w.homeTeam && w.awayTeam).map((w) => ({
            ...w,
            homeTeam: w.homeTeam || "",
            awayTeam: w.awayTeam || "",
            date: w.date.toISOString(),
            homeScore: w.homeScore ?? null,
            awayScore: w.awayScore ?? null,
          }))} />
        </div>

        {/* Wedstrijden sync met API */}
        <div className="kaart-dark anim-in" style={{ marginBottom: "1.5rem", animationDelay: "0.15s" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            🔄 Automatisch synchroniseren <span className="tekst-dim" style={{ fontWeight: 400 }}>({aantalWedstrijden})</span>
          </h2>
          <WedstrijdenSync aantalWedstrijden={aantalWedstrijden} />
        </div>
      </div>
    </main>
  );
}
