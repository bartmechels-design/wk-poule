import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import NieuweGroepForm from "./NieuweGroepForm";
import CopyCodeButton from "./CopyCodeButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const groepen = await db.group.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", padding: "0" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span style={{ fontSize: "1.3rem" }}>⚽</span>
          <span style={{ fontWeight: 900, color: "var(--goud)", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>WK Poule 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="tekst-dim" style={{ fontSize: "0.85rem" }}>{session.user.name}</span>
          <Link href="/">
            <button className="btn btn-ghost btn-sm">⚽ Leerlingenpagina</button>
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="btn btn-ghost btn-sm">Uitloggen</button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Nieuwe groep */}
        <div className="kaart anim-fade" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>➕ Nieuwe klas aanmaken</h2>
          <NieuweGroepForm />
        </div>

        {/* Groepen */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem" }}>📋 Jouw klassen ({groepen.length})</h2>
          {groepen.length > 0 && (
            <Link href="/klassement/school"><button className="btn btn-ghost btn-sm">🌍 Schoolbreed klassement</button></Link>
          )}
        </div>

        {groepen.length === 0 ? (
          <div className="kaart centreer" style={{ padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏫</div>
            <p className="tekst-dim">Maak je eerste klas aan om te beginnen!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}>
            {groepen.map((g) => (
              <div key={g.id} className="kaart-dark" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{g.name}</h3>
                    <p className="tekst-dim" style={{ fontSize: "0.82rem", marginTop: "0.2rem" }}>
                      {g._count.students} leerling{g._count.students !== 1 ? "en" : ""}
                    </p>
                  </div>
                  <CopyCodeButton code={g.code} />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link href={`/dashboard/groep/${g.id}`}><button className="btn btn-goud btn-sm">⚙️ Beheren</button></Link>
                  <Link href={`/klassement/${g.code}`}><button className="btn btn-ghost btn-sm">🏆 Klassement</button></Link>
                  <Link href={`/digibord/${g.code}`} target="_blank"><button className="btn btn-ghost btn-sm">📺 Digibord</button></Link>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "0.75rem" }}>
                  <p className="tekst-dim" style={{ fontSize: "0.75rem" }}>
                    Leerlingen gaan naar de site en voeren code in: <strong style={{ color: "var(--goud)", fontFamily: "monospace" }}>{g.code}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
