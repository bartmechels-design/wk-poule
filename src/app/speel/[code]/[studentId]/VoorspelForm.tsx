"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WK_TEAMS, getSuggestedScore, getFlagUrl } from "@/lib/wk-data";
import { useLang } from "@/components/LanguageProvider";
import WKStanden from "@/components/WKStanden";

type Wedstrijd = {
  id: string; homeTeam: string; awayTeam: string;
  homeFlag: string; awayFlag: string;
  date: string; stage: string; round: string | null;
  status: string; homeScore: number | null; awayScore: number | null;
};
type GespeeldeW = {
  id: string; homeTeam: string; awayTeam: string;
  homeFlag: string; awayFlag: string;
  homeScore: number; awayScore: number;
};
type Voorspelling = {
  matchId: string; predictedWinner: string;
  predictedHome: number; predictedAway: number; points: number;
};

const STAGE_NL: Record<string, string> = {
  GROUP: "Groepsfase", ROUND_OF_32: "Ronde van 32",
  ROUND_OF_16: "Achtste finale", QUARTER_FINAL: "Kwartfinale",
  SEMI_FINAL: "Halve finale", FINAL: "Finale",
};
const STAGE_PAP: Record<string, string> = {
  GROUP: "Fase di Grupo", ROUND_OF_32: "Ronde di 32",
  ROUND_OF_16: "Okto final", QUARTER_FINAL: "Kuart final",
  SEMI_FINAL: "Semi final", FINAL: "Final",
};
const STAGE_EN: Record<string, string> = {
  GROUP: "Group Stage", ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16", QUARTER_FINAL: "Quarter Final",
  SEMI_FINAL: "Semi Final", FINAL: "Final",
};
const STAGE_ES: Record<string, string> = {
  GROUP: "Fase de grupos", ROUND_OF_32: "Ronda de 32",
  ROUND_OF_16: "Octavos de final", QUARTER_FINAL: "Cuartos de final",
  SEMI_FINAL: "Semifinal", FINAL: "Final",
};

function winnaarVanScore(h: number, a: number) {
  return h > a ? "HOME" : h < a ? "AWAY" : "DRAW";
}

const inputStyle: React.CSSProperties = {
  width: 44,
  textAlign: "center",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "white",
  fontSize: "1.6rem",
  fontWeight: 900,
  padding: "0.15rem 0",
  lineHeight: 1,
  outline: "none",
};

export default function VoorspelForm({
  leerlingId, wedstrijden, openWedstrijdenIds, voorspelMap,
  wkWinnaar: initWK, gespeeldeWedstrijden,
}: {
  leerlingId: string; leerlingNaam: string;
  wedstrijden: Wedstrijd[]; openWedstrijdenIds: string[];
  voorspelMap: Record<string, Voorspelling>;
  wkWinnaar: string | null; gespeeldeWedstrijden: GespeeldeW[];
}) {
  const { t, lang } = useLang();
  const STAGE = lang === "pap" ? STAGE_PAP : lang === "en" ? STAGE_EN : lang === "es" ? STAGE_ES : STAGE_NL;

  const homeRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const awayRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [tab, setTab] = useState<"open" | "gespeeld" | "bonus" | "standen">("open");
  const [scores, setScores] = useState<Record<string, { h: number; a: number }>>(
    Object.fromEntries(
      Object.entries(voorspelMap).map(([id, v]) => [id, { h: v.predictedHome, a: v.predictedAway }])
    )
  );
  const [opgeslagen, setOpgeslagen] = useState<Record<string, "saving" | "ok" | "err">>({});
  const [clientSaved, setClientSaved] = useState<Record<string, { h: number; a: number }>>({});
  const [wkWinnaar, setWkWinnaar] = useState(initWK ?? "");
  const [wkOpgeslagen, setWkOpgeslagen] = useState(false);

  const openW = wedstrijden.filter((w) => openWedstrijdenIds.includes(w.id));

  // Focus first home input on mount
  useEffect(() => {
    if (openW.length > 0) {
      setTimeout(() => homeRefs.current[openW[0].id]?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getScore(id: string) {
    return scores[id] ?? { h: 0, a: 0 };
  }

  function aanpassen(id: string, kant: "h" | "a", delta: number) {
    setScores((prev) => {
      const cur = prev[id] ?? { h: 0, a: 0 };
      return { ...prev, [id]: { ...cur, [kant]: Math.max(0, cur[kant] + delta) } };
    });
  }

  const slaOp = useCallback(async (matchId: string) => {
    const s = getScore(matchId);
    const winnaar = winnaarVanScore(s.h, s.a);
    setOpgeslagen((p) => ({ ...p, [matchId]: "saving" }));

    const res = await fetch("/api/voorspellingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: leerlingId, matchId, predictedWinner: winnaar, predictedHome: s.h, predictedAway: s.a }),
    });

    if (res.ok) {
      setClientSaved((prev) => ({ ...prev, [matchId]: s }));
      setOpgeslagen((p) => ({ ...p, [matchId]: "ok" }));

      // Focus next match home input
      const ids = openW.map((w) => w.id);
      const idx = ids.indexOf(matchId);
      if (idx >= 0 && idx < ids.length - 1) {
        const nextId = ids[idx + 1];
        setTimeout(() => {
          homeRefs.current[nextId]?.focus();
          homeRefs.current[nextId]?.select();
          homeRefs.current[nextId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }

      setTimeout(() => setOpgeslagen((p) => ({ ...p, [matchId]: undefined as unknown as "ok" })), 2000);
    } else {
      setOpgeslagen((p) => ({ ...p, [matchId]: "err" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leerlingId, scores, openW]);

  async function slaWKOp() {
    if (!wkWinnaar) return;
    const res = await fetch("/api/voorspellingen/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: leerlingId, type: "WK_WINNER", value: wkWinnaar }),
    });
    if (res.ok) setWkOpgeslagen(true);
  }

  const rondes = openW.reduce<Record<string, Wedstrijd[]>>((acc, w) => {
    const key = `${STAGE[w.stage] ?? w.stage}${w.round ? ` – ${w.round}` : ""}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  const [uitlegOpen, setUitlegOpen] = useState(false);

  return (
    <div>
      {/* Puntenverdeling uitleg */}
      <div className="kaart" style={{ marginBottom: "1rem", padding: "0.75rem 1rem" }}>
        <button
          onClick={() => setUitlegOpen((v) => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--tekst)", padding: 0 }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{t.howPoints}</span>
          <span style={{ color: "var(--tekst-dim)", fontSize: "0.8rem" }}>{uitlegOpen ? t.hidePoints : t.showPoints}</span>
        </button>
        {uitlegOpen && (
          <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[
              { pts: "+2", label: t.pt2.replace("+2 ", "") },
              { pts: "+5", label: t.pt5.replace("+5 ", "") },
              { pts: "+1", label: t.pt1h.replace("+1 ", "") },
              { pts: "+1", label: t.pt1a.replace("+1 ", "") },
              { pts: "+10", label: "🏆 " + t.pt10.replace("+10 ", "") },
            ].map(({ pts, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.4rem 0.6rem" }}>
                <span style={{ fontWeight: 900, color: "var(--goud)", fontSize: "1rem", minWidth: 32 }}>{pts}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--tekst-dim)" }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "1.2rem", overflowX: "auto" }}>
        {(["open", "gespeeld", "standen", "bonus"] as const).map((tab_) => (
          <button key={tab_} onClick={() => setTab(tab_)} className={`tab-btn${tab === tab_ ? " actief" : ""}`} style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            {tab_ === "open" && `${t.tabPredict} (${openW.length})`}
            {tab_ === "gespeeld" && `${t.tabPlayed} (${gespeeldeWedstrijden.length})`}
            {tab_ === "standen" && t.tabStanden}
            {tab_ === "bonus" && t.tabBonus}
          </button>
        ))}
      </div>

      {/* ── OPEN WEDSTRIJDEN ── */}
      {tab === "open" && (
        <div>
          {openW.length === 0 ? (
            <div className="kaart centreer" style={{ padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <p className="tekst-dim">{t.noMatches}</p>
            </div>
          ) : (
            Object.entries(rondes).map(([ronde, ws]) => (
              <div key={ronde} style={{ marginBottom: "1.5rem" }}>
                <div className="groep-header">{ronde}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {ws.map((w) => {
                    const s = getScore(w.id);
                    const status = opgeslagen[w.id];
                    const datum = new Date(w.date);
                    const gesavedScore = clientSaved[w.id] ?? (voorspelMap[w.id] ? { h: voorspelMap[w.id].predictedHome, a: voorspelMap[w.id].predictedAway } : null);
                    const hadVoorspelling = !!gesavedScore;
                    const winnaar = winnaarVanScore(s.h, s.a);
                    const sug = getSuggestedScore(w.homeTeam, w.awayTeam);
                    const alIngevuld = s.h === sug.h && s.a === sug.a;

                    return (
                      <div
                        key={w.id}
                        style={{
                          background: "rgba(5,12,8,0.9)",
                          border: `1px solid ${status === "ok" ? "rgba(34,197,94,0.35)" : "var(--rand)"}`,
                          borderRadius: 14,
                          padding: "0.75rem 1rem",
                          transition: "border-color 0.2s",
                        }}
                      >
                        {/* Datum + opgeslagen score */}
                        <div style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--tekst-dim)", marginBottom: "0.5rem" }}>
                          {datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                          {hadVoorspelling && (
                            <span> · jouw keuze: {gesavedScore!.h}–{gesavedScore!.a}</span>
                          )}
                        </div>

                        {/* Hoofd-rij: vlag+naam – score – naam+vlag */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

                          {/* Thuis */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", minWidth: 0 }}>
                            <img src={getFlagUrl(w.homeTeam)} alt={w.homeTeam} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }} />
                            <span style={{ fontSize: "0.65rem", color: winnaar === "HOME" ? "var(--goud)" : "var(--tekst-dim)", textAlign: "center", wordBreak: "break-word", lineHeight: 1.2 }}>
                              {w.homeTeam}
                            </span>
                          </div>

                          {/* Score picker */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                            {/* Thuis score */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                              <button
                                type="button"
                                onClick={() => aanpassen(w.id, "h", 1)}
                                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 30, height: 24, color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}
                              >+</button>
                              <input
                                ref={(el) => { homeRefs.current[w.id] = el; }}
                                type="number"
                                min={0}
                                value={s.h}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setScores((prev) => ({ ...prev, [w.id]: { ...prev[w.id] ?? { h: 0, a: 0 }, h: val } }));
                                }}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") { e.preventDefault(); slaOp(w.id); return; }
                                  if (/^\d$/.test(e.key)) {
                                    setTimeout(() => { awayRefs.current[w.id]?.focus(); awayRefs.current[w.id]?.select(); }, 0);
                                  }
                                }}
                                style={{ ...inputStyle, color: winnaar === "HOME" ? "var(--goud)" : "white" }}
                              />
                              <button
                                type="button"
                                onClick={() => aanpassen(w.id, "h", -1)}
                                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 30, height: 24, color: "var(--tekst-dim)", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}
                              >−</button>
                            </div>

                            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--tekst-dim)" }}>:</span>

                            {/* Uit score */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                              <button
                                type="button"
                                onClick={() => aanpassen(w.id, "a", 1)}
                                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 30, height: 24, color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}
                              >+</button>
                              <input
                                ref={(el) => { awayRefs.current[w.id] = el; }}
                                type="number"
                                min={0}
                                value={s.a}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setScores((prev) => ({ ...prev, [w.id]: { ...prev[w.id] ?? { h: 0, a: 0 }, a: val } }));
                                }}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); slaOp(w.id); } }}
                                style={{ ...inputStyle, color: winnaar === "AWAY" ? "var(--goud)" : "white" }}
                              />
                              <button
                                type="button"
                                onClick={() => aanpassen(w.id, "a", -1)}
                                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 30, height: 24, color: "var(--tekst-dim)", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}
                              >−</button>
                            </div>
                          </div>

                          {/* Uit */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", minWidth: 0 }}>
                            <img src={getFlagUrl(w.awayTeam)} alt={w.awayTeam} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }} />
                            <span style={{ fontSize: "0.65rem", color: winnaar === "AWAY" ? "var(--goud)" : "var(--tekst-dim)", textAlign: "center", wordBreak: "break-word", lineHeight: 1.2 }}>
                              {w.awayTeam}
                            </span>
                          </div>
                        </div>

                        {/* Acties: suggestie + opslaan */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.65rem" }}>
                          <button
                            type="button"
                            onClick={() => setScores(prev => ({ ...prev, [w.id]: { h: sug.h, a: sug.a } }))}
                            style={{
                              background: alIngevuld ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${alIngevuld ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                              borderRadius: "6px", padding: "0.25rem 0.6rem",
                              fontSize: "0.68rem",
                              color: alIngevuld ? "#4ade80" : "var(--tekst-dim)",
                              cursor: alIngevuld ? "default" : "pointer",
                            }}
                          >
                            📊 {sug.h}–{sug.a}
                          </button>
                          <button
                            type="button"
                            onClick={() => slaOp(w.id)}
                            disabled={status === "saving"}
                            className="btn btn-sm"
                            style={{
                              background: status === "ok" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.15)",
                              color: status === "ok" ? "#4ade80" : "var(--goud)",
                              border: `1px solid ${status === "ok" ? "rgba(34,197,94,0.4)" : "rgba(245,158,11,0.3)"}`,
                              minWidth: 80,
                            }}
                          >
                            {status === "saving" ? t.saving : status === "ok" ? t.saved : hadVoorspelling ? t.update : t.save}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── GESPEELD ── */}
      {tab === "gespeeld" && (
        <div>
          {gespeeldeWedstrijden.length === 0 ? (
            <div className="kaart centreer" style={{ padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
              <p className="tekst-dim">{t.noPlayed}</p>
            </div>
          ) : (
            <div className="kaart-dark" style={{ padding: 0, overflow: "hidden" }}>
              <table className="sport-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>{t.home}</th>
                    <th style={{ textAlign: "center" }}>{t.away}</th>
                    <th style={{ textAlign: "center" }}>{t.prediction}</th>
                    <th style={{ textAlign: "center" }}>{t.result}</th>
                    <th style={{ textAlign: "center" }}>{t.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {gespeeldeWedstrijden.map((w) => {
                    const v = voorspelMap[w.id];
                    const punten = v?.points ?? 0;
                    const exactJuist = v && v.predictedHome === w.homeScore && v.predictedAway === w.awayScore;

                    return (
                      <tr key={w.id}>
                        <td>
                          <div className="team-cel">
                            <img src={getFlagUrl(w.homeTeam)} alt={w.homeTeam} style={{ width: 24, borderRadius: 2 }} />
                            <span className="team-naam" style={{ fontSize: "0.85rem" }}>{w.homeTeam}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="team-cel" style={{ justifyContent: "center" }}>
                            <img src={getFlagUrl(w.awayTeam)} alt={w.awayTeam} style={{ width: 24, borderRadius: 2 }} />
                            <span className="team-naam" style={{ fontSize: "0.85rem" }}>{w.awayTeam}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {v ? (
                            <span className="score-display" style={{ fontSize: "0.85rem" }}>
                              {v.predictedHome} – {v.predictedAway}
                            </span>
                          ) : (
                            <span className="tekst-dim" style={{ fontSize: "0.8rem" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`score-display${exactJuist ? " correct" : ""}`} style={{ fontSize: "0.85rem" }}>
                            {w.homeScore} – {w.awayScore}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`punten-badge ${punten > 0 ? "hoog" : "nul"}`}>
                            {punten > 0 ? `+${punten}` : "0"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── BONUS ── */}
      {tab === "bonus" && (
        <div className="kaart">
          <div className="centreer" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏆</div>
            <h2>{t.bonusTitle}</h2>
            <p className="tekst-dim" style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>
              {t.bonusSub}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.5rem", marginBottom: "1.5rem", maxHeight: "320px", overflowY: "auto" }}>
            {WK_TEAMS.map((team) => (
              <button
                key={team.name}
                onClick={() => setWkWinnaar(team.name)}
                style={{
                  background: wkWinnaar === team.name ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${wkWinnaar === team.name ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "10px",
                  padding: "0.6rem 0.4rem",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                  transform: wkWinnaar === team.name ? "scale(1.05)" : "scale(1)",
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{team.flag}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: wkWinnaar === team.name ? "var(--goud)" : "var(--tekst)", marginTop: "0.2rem" }}>
                  {team.name}
                </div>
              </button>
            ))}
          </div>

          {wkWinnaar && (
            <div style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.9rem", color: "var(--tekst-dim)" }}>
              {t.bonusAlready} <strong style={{ color: "var(--goud)" }}>{wkWinnaar}</strong>
            </div>
          )}

          <button
            onClick={slaWKOp}
            disabled={!wkWinnaar || wkOpgeslagen}
            className="btn btn-goud btn-lg"
            style={{ width: "100%" }}
          >
            {wkOpgeslagen ? t.bonusSaved : t.bonusSave}
          </button>
        </div>
      )}

      {/* ── STANDEN ── */}
      {tab === "standen" && <WKStanden wedstrijden={wedstrijden} />}
    </div>
  );
}
