"use client";

import { useState, useMemo } from "react";
import { WK_TEAMS, getCode, getFlagUrl } from "@/lib/wk-data";
import { useLang } from "@/components/LanguageProvider";

export type WedstrijdStand = {
  id: string; homeTeam: string; awayTeam: string;
  homeScore: number | null; awayScore: number | null;
  stage: string; round: string | null; status: string; date: string;
};

type TeamStats = { team: string; mp: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number };

const STAGE_NL: Record<string, string> = { GROUP: "Groepsfase", ROUND_OF_32: "Ronde van 32", ROUND_OF_16: "Achttiende finales", QUARTER_FINAL: "Kwartfinales", SEMI_FINAL: "Halve finales", FINAL: "Finale" };
const STAGE_PAP: Record<string, string> = { GROUP: "Fase di Grupo", ROUND_OF_32: "Ronde di 32", ROUND_OF_16: "18 final", QUARTER_FINAL: "Kuart final", SEMI_FINAL: "Semi final", FINAL: "Final" };
const STAGE_EN: Record<string, string> = { GROUP: "Group Stage", ROUND_OF_32: "Round of 32", ROUND_OF_16: "Round of 16", QUARTER_FINAL: "Quarter Final", SEMI_FINAL: "Semi Final", FINAL: "Final" };
const STAGE_ES: Record<string, string> = { GROUP: "Fase de grupos", ROUND_OF_32: "Ronda de 32", ROUND_OF_16: "Dieciseisavos", QUARTER_FINAL: "Cuartos de final", SEMI_FINAL: "Semifinal", FINAL: "Final" };
const STAGE_ORDER = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"];

function berekenStanden(wedstrijden: WedstrijdStand[]): Record<string, TeamStats[]> {
  const stats: Record<string, TeamStats> = {};
  for (const team of WK_TEAMS) {
    stats[team.name] = { team: team.name, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  }
  for (const m of wedstrijden) {
    if (m.stage !== "GROUP" || m.homeScore === null || m.awayScore === null) continue;
    const h = stats[m.homeTeam], a = stats[m.awayTeam];
    if (!h || !a) continue;
    h.mp++; a.mp++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
    if (m.homeScore > m.awayScore) { h.w++; h.pts += 3; a.l++; }
    else if (m.homeScore < m.awayScore) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; h.pts++; a.d++; a.pts++; }
  }
  const groepen: Record<string, TeamStats[]> = {};
  for (const team of WK_TEAMS) {
    if (!groepen[team.group]) groepen[team.group] = [];
    groepen[team.group].push(stats[team.name]);
  }
  for (const groep of Object.values(groepen)) {
    groep.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
  }
  return groepen;
}

export default function WKStanden({ wedstrijden }: { wedstrijden: WedstrijdStand[] }) {
  const { t, lang } = useLang();
  const [selectedGroep, setSelectedGroep] = useState("A");

  const STAGE = lang === "pap" ? STAGE_PAP : lang === "en" ? STAGE_EN : lang === "es" ? STAGE_ES : STAGE_NL;

  const standen = useMemo(() => berekenStanden(wedstrijden), [wedstrijden]);
  const knockoutWedstrijden = useMemo(
    () => wedstrijden.filter(w => w.stage !== "GROUP").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [wedstrijden]
  );

  const groepTeams = standen[selectedGroep] ?? [];
  const anyPlayed = groepTeams.some(s => s.mp > 0);

  return (
    <div>
      {/* Groep selector A–L */}
      <div style={{ display: "flex", gap: "0.3rem", overflowX: "auto", marginBottom: "1rem", paddingBottom: "0.25rem" }}>
        {"ABCDEFGHIJKL".split("").map(g => (
          <button
            key={g}
            onClick={() => setSelectedGroep(g)}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: "none",
              background: selectedGroep === g ? "var(--goud)" : "rgba(255,255,255,0.08)",
              color: selectedGroep === g ? "#000" : "var(--tekst-dim)",
              fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.15s",
            }}
          >{g}</button>
        ))}
      </div>

      {/* Standings tabel */}
      <div className="kaart-dark" style={{ padding: 0, overflow: "hidden", marginBottom: "1.5rem" }}>
        <div style={{ padding: "0.6rem 1rem 0.4rem", borderBottom: "1px solid var(--rand)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--goud)" }}>{t.groep} {selectedGroep}</span>
          {!anyPlayed && <span className="tekst-dim" style={{ fontSize: "0.72rem" }}>Nog niet gespeeld</span>}
        </div>
        <table className="sport-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: 28 }}>#</th>
              <th>Team</th>
              <th style={{ textAlign: "center", width: 32 }}>GS</th>
              <th style={{ textAlign: "center", width: 28 }}>W</th>
              <th style={{ textAlign: "center", width: 28 }}>G</th>
              <th style={{ textAlign: "center", width: 28 }}>V</th>
              <th style={{ textAlign: "center", width: 36 }}>DS</th>
              <th style={{ textAlign: "center", width: 40 }}>Ptn</th>
            </tr>
          </thead>
          <tbody>
            {groepTeams.map((team, i) => (
              <tr key={team.team} style={{ background: i < 2 && anyPlayed ? "rgba(245,158,11,0.05)" : undefined }}>
                <td>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: i < 2 ? "var(--goud)" : "var(--tekst-dim)" }}>{i + 1}</span>
                </td>
                <td>
                  <div className="flex-midden gap-sm">
                    <img src={getFlagUrl(team.team)} alt={team.team} style={{ width: 22, height: "auto", borderRadius: 2 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: i < 2 ? "white" : "var(--tekst)" }}>{getCode(team.team)}</span>
                  </div>
                </td>
                <td style={{ textAlign: "center", color: "var(--tekst-dim)", fontSize: "0.82rem" }}>{team.mp}</td>
                <td style={{ textAlign: "center", fontSize: "0.82rem", color: team.w > 0 ? "#4ade80" : "var(--tekst-dim)" }}>{team.w}</td>
                <td style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--tekst-dim)" }}>{team.d}</td>
                <td style={{ textAlign: "center", fontSize: "0.82rem", color: team.l > 0 ? "#f87171" : "var(--tekst-dim)" }}>{team.l}</td>
                <td style={{ textAlign: "center", fontSize: "0.82rem", color: team.gd > 0 ? "#4ade80" : team.gd < 0 ? "#f87171" : "var(--tekst-dim)" }}>
                  {team.gd > 0 ? `+${team.gd}` : team.gd}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ fontWeight: 900, fontSize: "1rem", color: i < 2 && anyPlayed ? "var(--goud)" : "white" }}>{team.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {anyPlayed && (
          <div style={{ padding: "0.4rem 1rem", borderTop: "1px solid var(--rand)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--goud)", display: "inline-block" }} />
            <span className="tekst-dim" style={{ fontSize: "0.68rem" }}>Plaatsen zich voor de volgende ronde</span>
          </div>
        )}
      </div>

      {/* Finalerondes */}
      <div className="groep-header" style={{ marginBottom: "0.75rem" }}>{t.finalerondes}</div>
      {knockoutWedstrijden.length === 0 ? (
        <div className="kaart centreer" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
          <p className="tekst-dim" style={{ fontSize: "0.85rem" }}>{t.noKnockout}</p>
        </div>
      ) : (
        (() => {
          const stageGroups = knockoutWedstrijden.reduce<Record<string, WedstrijdStand[]>>((acc, w) => {
            if (!acc[w.stage]) acc[w.stage] = [];
            acc[w.stage].push(w);
            return acc;
          }, {});
          return STAGE_ORDER.filter(s => stageGroups[s]).map(stage => (
            <div key={stage} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--tekst-dim)", marginBottom: "0.4rem", paddingLeft: "0.25rem" }}>
                {STAGE[stage] ?? stage}
              </div>
              <div className="kaart-dark" style={{ padding: 0, overflow: "hidden" }}>
                {stageGroups[stage].map((w, i) => {
                  const gespeeld = w.homeScore !== null && w.awayScore !== null;
                  return (
                    <div key={w.id} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.85rem",
                      borderBottom: i < stageGroups[stage].length - 1 ? "1px solid var(--rand)" : "none",
                    }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: gespeeld && w.homeScore! > w.awayScore! ? 700 : 500, color: gespeeld && w.homeScore! > w.awayScore! ? "white" : "var(--tekst-dim)" }}>
                          {w.homeTeam || "?"}
                        </span>
                        {w.homeTeam && <img src={getFlagUrl(w.homeTeam)} alt="" style={{ width: 20, borderRadius: 2 }} />}
                      </div>
                      <div style={{ flexShrink: 0, background: "rgba(0,0,0,0.4)", border: "1px solid var(--rand)", borderRadius: 6, padding: "0.2rem 0.5rem", fontWeight: 800, fontSize: "0.85rem", minWidth: 52, textAlign: "center", color: gespeeld ? "white" : "var(--tekst-dim)", fontVariantNumeric: "tabular-nums" }}>
                        {gespeeld ? `${w.homeScore} – ${w.awayScore}` : "– – –"}
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {w.awayTeam && <img src={getFlagUrl(w.awayTeam)} alt="" style={{ width: 20, borderRadius: 2 }} />}
                        <span style={{ fontSize: "0.82rem", fontWeight: gespeeld && w.awayScore! > w.homeScore! ? 700 : 500, color: gespeeld && w.awayScore! > w.homeScore! ? "white" : "var(--tekst-dim)" }}>
                          {w.awayTeam || "?"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()
      )}
    </div>
  );
}
