"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { HomeBtn, BackBtn } from "@/components/NavBar";
import WKStanden, { type WedstrijdStand } from "@/components/WKStanden";

type Student = { id: string; name: string; totalPoints: number; _count: { predictions: number } };

const podiumKleur = ["var(--goud)", "var(--zilver, #94a3b8)", "#b45309"];
const podiumEmoji = ["🥇", "🥈", "🥉"];

export default function KlassementClient({ groepNaam, groepCode, groepId, students, wedstrijden }: {
  groepNaam: string; groepCode: string; groepId: string; students: Student[]; wedstrijden: WedstrijdStand[];
}) {
  const { t } = useLang();
  const [tab, setTab] = useState<"klassement" | "standen">("klassement");

  return (
    <main style={{ minHeight: "100vh", padding: "0" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", padding: "0.7rem 1.2rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <BackBtn />
        <HomeBtn />
        <Link href={`/dashboard/groep/${groepId}`}><button className="btn btn-ghost btn-sm">🏫 Beheren</button></Link>
        <Link href={`/digibord/${groepCode}`} target="_blank"><button className="btn btn-ghost btn-sm">📺 Digibord</button></Link>
        <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--goud)", fontSize: "0.88rem" }}>{groepNaam}</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>

        <div className="centreer anim-fade" style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--goud)", marginBottom: "0.4rem" }}>
            🏆 {groepNaam}
          </div>
          <h1 style={{ fontSize: "2rem" }}>WK Poule 2026</h1>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: "1.5rem" }}>
          <button onClick={() => setTab("klassement")} className={`tab-btn${tab === "klassement" ? " actief" : ""}`}>
            🏆 {t.standings}
          </button>
          <button onClick={() => setTab("standen")} className={`tab-btn${tab === "standen" ? " actief" : ""}`}>
            {t.tabStanden}
          </button>
        </div>

        {/* ── KLASSEMENT ── */}
        {tab === "klassement" && (
          <>
            {/* Podium top 3 */}
            {students.length >= 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "0.75rem", marginBottom: "2rem", alignItems: "flex-end" }}>
                <div className="anim-in" style={{ animationDelay: "0.1s" }}>
                  {students[1] ? (
                    <div style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "12px", padding: "1.2rem 0.8rem", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🥈</div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{students[1].name}</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#94a3b8" }}>{students[1].totalPoints}</div>
                      <div className="tekst-dim" style={{ fontSize: "0.72rem" }}>{t.points}</div>
                    </div>
                  ) : <div />}
                </div>

                <div className="anim-in">
                  <div style={{ background: "rgba(245,158,11,0.12)", border: "2px solid rgba(245,158,11,0.4)", borderRadius: "14px", padding: "1.4rem 0.8rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.4rem" }} className="trophy-anim">🥇</div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.2rem" }}>{students[0].name}</div>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--goud)" }}>{students[0].totalPoints}</div>
                    <div className="tekst-dim" style={{ fontSize: "0.72rem" }}>{t.points}</div>
                  </div>
                </div>

                <div className="anim-in" style={{ animationDelay: "0.2s" }}>
                  {students[2] ? (
                    <div style={{ background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.2)", borderRadius: "12px", padding: "1rem 0.8rem", textAlign: "center" }}>
                      <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>🥉</div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.2rem" }}>{students[2].name}</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#b45309" }}>{students[2].totalPoints}</div>
                      <div className="tekst-dim" style={{ fontSize: "0.72rem" }}>{t.points}</div>
                    </div>
                  ) : <div />}
                </div>
              </div>
            )}

            <div className="kaart-dark anim-in" style={{ padding: 0, overflow: "hidden", animationDelay: "0.3s" }}>
              <table className="sport-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>{t.rank}</th>
                    <th>{t.name}</th>
                    <th style={{ textAlign: "center" }}>{t.predicted}</th>
                    <th style={{ textAlign: "right" }}>{t.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: i < 3 ? podiumKleur[i] : "var(--tekst-dim)", fontSize: i === 0 ? "1rem" : "0.9rem" }}>
                          {podiumEmoji[i] ?? `${i + 1}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex-midden gap-sm">
                          <span style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: i < 3 ? `${podiumKleur[i]}22` : "rgba(255,255,255,0.08)",
                            border: `1px solid ${i < 3 ? `${podiumKleur[i]}44` : "rgba(255,255,255,0.1)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.8rem", fontWeight: 700,
                            color: i < 3 ? podiumKleur[i] : "var(--tekst-dim)",
                          }}>
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ fontWeight: i < 3 ? 700 : 500 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="tekst-dim" style={{ fontSize: "0.82rem" }}>{s._count.predictions}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 800, fontSize: i === 0 ? "1.1rem" : "1rem", color: i < 3 ? podiumKleur[i] : "white" }}>
                          {s.totalPoints}
                        </span>
                        <span className="tekst-dim" style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>pt</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── WK STANDEN ── */}
        {tab === "standen" && <WKStanden wedstrijden={wedstrijden} />}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/speel/${groepCode}`}><button className="btn btn-ghost btn-sm">⚽ {t.tabPredict.replace("⚽ ", "")}</button></Link>
          <Link href="/klassement/school"><button className="btn btn-ghost btn-sm">🌍 {t.schoolWide}</button></Link>
          <Link href={`/digibord/${groepCode}`} target="_blank"><button className="btn btn-goud btn-sm">{t.digibord}</button></Link>
        </div>
      </div>
    </main>
  );
}
