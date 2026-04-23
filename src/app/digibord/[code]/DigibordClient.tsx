"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/wk-data";
import { useLang } from "@/components/LanguageProvider";

type Leerling = { id: string; name: string; totalPoints: number };
type Wedstrijd = { homeTeam: string; awayTeam: string; date: string };
type Uitslag = { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number };
type WinnaarDag = { name: string; punten: number };

export default function DigibordClient({
  groepNaam, groepCode, groepId, leerlingen: init,
  volgendeWedstrijd: initVolgend, laasteWedstrijd: initLaatst, winnaarVanDag: initWinnaar,
}: {
  groepNaam: string; groepCode: string; groepId: string; leerlingen: Leerling[];
  volgendeWedstrijd: Wedstrijd | null; laasteWedstrijd: Uitslag | null;
  winnaarVanDag: WinnaarDag | null;
}) {
  const { t } = useLang();
  const [leerlingen, setLeerlingen] = useState(init);
  const [volgend, setVolgend] = useState(initVolgend);
  const [laatst, setLaatst] = useState(initLaatst);
  const [winnaar, setWinnaar] = useState(initWinnaar);
  const [nu, setNu] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNu(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/digibord/${groepCode}`);
      if (!res.ok) return;
      const d = await res.json();
      setLeerlingen(d.leerlingen);
      setVolgend(d.volgendeWedstrijd);
      setLaatst(d.laasteWedstrijd);
      setWinnaar(d.winnaarVanDag);
    } catch {}
  }, [groepCode]);

  useEffect(() => {
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh]);

  function countdown() {
    if (!volgend) return null;
    const diff = new Date(volgend.date).getTime() - nu.getTime();
    if (diff <= 0) return "Nu bezig! ⚽";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}u ${m}m`;
    if (h > 0) return `${h}u ${m}m ${s}s`;
    return `${m}m ${s}s`;
  }

  const KLEUREN = ["#F59E0B", "#94a3b8", "#b45309"];
  const EMOJI = ["🥇", "🥈", "🥉"];
  const top3 = leerlingen.slice(0, 3);
  const rest = leerlingen.slice(3);

  return (
    <div style={{ minHeight: "100vh", padding: "1.5rem", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>⚽</span>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--goud)" }}>{t.appTitle}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "white", lineHeight: 1.1 }}>{groepNaam}</div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginLeft: "0.5rem" }}>
            <Link href={`/dashboard/groep/${groepId}`}><button className="btn btn-ghost btn-sm">🏫 Beheren</button></Link>
            <Link href={`/klassement/${groepCode}`}><button className="btn btn-ghost btn-sm">🏆 Klassement</button></Link>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "white", fontVariantNumeric: "tabular-nums" }}>
            {nu.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--tekst-dim)" }}>
            {nu.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>

        {/* Links: podium + klassement */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Podium top 3 (volgorde: zilver - goud - brons) */}
          {top3.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: "0.6rem", alignItems: "flex-end" }}>
              {[
                { l: top3[1], rank: 1 },
                { l: top3[0], rank: 0 },
                { l: top3[2], rank: 2 },
              ].map(({ l, rank }) => {
                if (!l) return <div key={rank} />;
                const isGoud = rank === 0;
                return (
                  <div key={l.id} style={{
                    background: isGoud ? "rgba(245,158,11,0.12)" : rank === 1 ? "rgba(148,163,184,0.08)" : "rgba(180,83,9,0.08)",
                    border: `${isGoud ? "2px" : "1px"} solid ${isGoud ? "rgba(245,158,11,0.5)" : rank === 1 ? "rgba(148,163,184,0.2)" : "rgba(180,83,9,0.2)"}`,
                    borderRadius: isGoud ? 18 : 14,
                    padding: isGoud ? "1.4rem 0.75rem" : "1rem 0.6rem",
                    textAlign: "center",
                    boxShadow: isGoud ? "0 0 30px rgba(245,158,11,0.15)" : "none",
                  }}>
                    <div style={{ fontSize: isGoud ? "2.5rem" : "1.8rem", animation: isGoud ? "pulse 2s infinite" : "none" }}>
                      {EMOJI[rank]}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: isGoud ? "1.1rem" : "0.9rem", margin: "0.4rem 0 0.2rem", color: "white" }}>
                      {l.name}
                    </div>
                    <div style={{ fontSize: isGoud ? "2rem" : "1.4rem", fontWeight: 900, color: KLEUREN[rank] }}>
                      {l.totalPoints}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{t.points}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest klassement */}
          {rest.length > 0 && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {rest.map((l, i) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.6rem 1rem", width: 36, fontWeight: 700, color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>
                        {i + 4}
                      </td>
                      <td style={{ fontWeight: 500, fontSize: "0.95rem", color: "white" }}>{l.name}</td>
                      <td style={{ textAlign: "right", padding: "0.6rem 1rem", fontWeight: 800, color: "white" }}>
                        {l.totalPoints} <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>pt</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rechts: wedstrijd info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Winnaar van de dag */}
          {winnaar && (
            <div style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))",
              border: "1px solid rgba(245,158,11,0.4)", borderRadius: 16, padding: "1rem 1.2rem",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <div style={{ fontSize: "2.5rem" }}>🌟</div>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--goud)", marginBottom: 4 }}>
                  {t.dayWinner}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "white" }}>{winnaar.name}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--goud)", fontWeight: 700 }}>+{winnaar.punten} {t.dayWinnerPts}</div>
              </div>
            </div>
          )}

          {/* Volgende wedstrijd */}
          {volgend && (
            <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.2rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--tekst-dim)", marginBottom: "1rem" }}>
                {t.nextMatch}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <img src={getFlagUrl(volgend.homeTeam)} alt={volgend.homeTeam} style={{ width: 56, borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{volgend.homeTeam}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "rgba(255,255,255,0.3)" }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <img src={getFlagUrl(volgend.awayTeam)} alt={volgend.awayTeam} style={{ width: 56, borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{volgend.awayTeam}</div>
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "0.75rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--goud)", fontVariantNumeric: "tabular-nums" }}>
                  {countdown() ?? "—"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {new Date(volgend.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                  {" · "}
                  {new Date(volgend.date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          )}

          {/* Laatste uitslag */}
          {laatst && (
            <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.2rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
                {t.lastResult}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ textAlign: "center" }}>
                  <img src={getFlagUrl(laatst.homeTeam)} alt={laatst.homeTeam} style={{ width: 48, borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{laatst.homeTeam}</div>
                </div>
                <div>
                  <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                    {laatst.homeScore} – {laatst.awayScore}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <img src={getFlagUrl(laatst.awayTeam)} alt={laatst.awayTeam} style={{ width: 48, borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{laatst.awayTeam}</div>
                </div>
              </div>
            </div>
          )}

          {/* Code onderaan */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "0.9rem", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{t.joinCode}</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--goud)", fontFamily: "monospace", letterSpacing: "0.15em" }}>{groepCode}</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "0.75rem" }}>
        {t.autoRefresh}
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
    </div>
  );
}
