"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { HomeBtn } from "@/components/NavBar";

type Student = { id: string; name: string; totalPoints: number; group: { name: string; code: string } };

const podiumKleur = ["var(--goud)", "#94a3b8", "#b45309"];
const podiumEmoji = ["🥇", "🥈", "🥉"];

export default function SchoolKlassementClient({ students }: { students: Student[] }) {
  const { t } = useLang();

  return (
    <main style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div className="centreer anim-fade" style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--goud)", marginBottom: "0.4rem" }}>
            🌍 {t.schoolWide}
          </div>
          <h1 style={{ fontSize: "2rem" }}>{t.allClasses}</h1>
        </div>

        <div className="kaart-dark anim-in" style={{ padding: 0, overflow: "hidden" }}>
          {students.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <p className="tekst-dim">{t.noStudents}</p>
            </div>
          ) : (
            <table className="sport-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>{t.rank}</th>
                  <th>{t.name}</th>
                  <th>Klas</th>
                  <th style={{ textAlign: "right" }}>{t.points}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: i < 3 ? podiumKleur[i] : "var(--tekst-dim)" }}>
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
                    <td>
                      <span className="tekst-dim" style={{ fontSize: "0.82rem" }}>{s.group.name}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 800, color: i < 3 ? podiumKleur[i] : "white" }}>{s.totalPoints}</span>
                      <span className="tekst-dim" style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>pt</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <HomeBtn />
        </div>
      </div>
    </main>
  );
}
