"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getFlagUrl } from "@/lib/wk-data";

type Wedstrijd = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  date: string;
  round: string | null;
};

export default function UitslagenBeheer({ wedstrijden }: { wedstrijden: Wedstrijd[] }) {
  const router = useRouter();
  const homeRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const awayRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [scores, setScores] = useState<Record<string, { h: string; a: string }>>(
    Object.fromEntries(
      wedstrijden.map((w) => [w.id, {
        h: w.homeScore !== null ? String(w.homeScore) : "",
        a: w.awayScore !== null ? String(w.awayScore) : "",
      }])
    )
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [wisBusy, setWisBusy] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"aankomend" | "gespeeld">("aankomend");

  const nu = new Date();
  const getoond = wedstrijden.filter((w) =>
    filter === "aankomend" ? w.status !== "FINISHED" : w.status === "FINISHED"
  );

  function handleHomeChange(matchId: string, value: string) {
    setScores((p) => ({ ...p, [matchId]: { ...p[matchId], h: value } }));
  }

  function handleHomeKeyDown(e: React.KeyboardEvent<HTMLInputElement>, matchId: string) {
    if (e.key === "Enter") { e.preventDefault(); opslaan(matchId); return; }
    if (/^\d$/.test(e.key)) {
      setTimeout(() => { awayRefs.current[matchId]?.focus(); awayRefs.current[matchId]?.select(); }, 0);
    }
  }

  async function opslaan(matchId: string) {
    const s = scores[matchId];
    if (s.h === "" || s.a === "") return;
    setSaving((p) => ({ ...p, [matchId]: true }));

    const res = await fetch("/api/wedstrijden/uitslag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: Number(s.h), awayScore: Number(s.a) }),
    });

    setSaving((p) => ({ ...p, [matchId]: false }));
    if (res.ok) {
      setDone((p) => ({ ...p, [matchId]: true }));

      // Jump to next match
      const ids = getoond.map((w) => w.id);
      const idx = ids.indexOf(matchId);
      if (idx >= 0 && idx < ids.length - 1) {
        const nextId = ids[idx + 1];
        setTimeout(() => {
          homeRefs.current[nextId]?.focus();
          homeRefs.current[nextId]?.select();
        }, 100);
      }

      setTimeout(() => {
        setDone((p) => ({ ...p, [matchId]: false }));
        router.refresh();
      }, 2000);
    }
  }

  async function wisUitslag(matchId: string) {
    if (!confirm("Uitslag wissen? De punten worden ook teruggedraaid.")) return;
    setWisBusy((p) => ({ ...p, [matchId]: true }));
    await fetch("/api/wedstrijden/uitslag", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    setWisBusy((p) => ({ ...p, [matchId]: false }));
    router.refresh();
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["aankomend", "gespeeld"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? "btn-goud" : "btn-ghost"}`}
          >
            {f === "aankomend" ? "⏳ Aankomend" : "✅ Gespeeld"}
          </button>
        ))}
      </div>

      {getoond.length === 0 && (
        <p className="tekst-dim" style={{ fontSize: "0.85rem", padding: "1rem 0" }}>
          Geen wedstrijden in deze categorie.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {getoond.map((w) => {
          const s = scores[w.id] ?? { h: "", a: "" };
          const datum = new Date(w.date);
          const isVerlopen = datum < nu;

          return (
            <div key={w.id} style={{
              background: "rgba(255,255,255,0.04)",
              border: done[w.id] ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "0.75rem 1rem",
            }}>
              {/* Datum + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.65rem", color: "var(--tekst-dim)" }}>
                  {datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  {w.round && <span> · {w.round}</span>}
                </span>
                {w.status === "FINISHED" ? (
                  <span style={{ fontSize: "0.65rem", color: "#4ade80", fontWeight: 600 }}>✓ Definitief</span>
                ) : isVerlopen ? (
                  <span style={{ fontSize: "0.65rem", color: "#f87171", fontWeight: 600 }}>Voer in!</span>
                ) : (
                  <span style={{ fontSize: "0.65rem", color: "var(--tekst-dim)" }}>Gepland</span>
                )}
              </div>

              {/* Teams + score */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Thuis */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                  <img src={getFlagUrl(w.homeTeam)} alt={w.homeTeam} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontSize: "0.65rem", color: "var(--tekst-dim)", textAlign: "center", lineHeight: 1.3 }}>
                    {w.homeTeam}
                  </span>
                </div>

                {/* Score invoer */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                  <input
                    ref={(el) => { homeRefs.current[w.id] = el; }}
                    type="number" min={0} max={20} value={s.h}
                    onChange={(e) => handleHomeChange(w.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => handleHomeKeyDown(e, w.id)}
                    style={{
                      width: 52, textAlign: "center", background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
                      color: "white", fontSize: "1.6rem", fontWeight: 900, padding: "0.25rem",
                    }}
                  />
                  <span style={{ color: "var(--tekst-dim)", fontWeight: 900, fontSize: "1.4rem" }}>:</span>
                  <input
                    ref={(el) => { awayRefs.current[w.id] = el; }}
                    type="number" min={0} max={20} value={s.a}
                    onChange={(e) => setScores((p) => ({ ...p, [w.id]: { ...p[w.id], a: e.target.value } }))}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); opslaan(w.id); } }}
                    style={{
                      width: 52, textAlign: "center", background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
                      color: "white", fontSize: "1.6rem", fontWeight: 900, padding: "0.25rem",
                    }}
                  />
                </div>

                {/* Uit */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                  <img src={getFlagUrl(w.awayTeam)} alt={w.awayTeam} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontSize: "0.65rem", color: "var(--tekst-dim)", textAlign: "center", lineHeight: 1.3 }}>
                    {w.awayTeam}
                  </span>
                </div>
              </div>

              {/* Opslaan + Wissen */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button
                  onClick={() => opslaan(w.id)}
                  disabled={saving[w.id] || s.h === "" || s.a === ""}
                  style={{
                    flex: 1,
                    background: done[w.id] ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.2)",
                    border: `1px solid ${done[w.id] ? "rgba(34,197,94,0.5)" : "rgba(245,158,11,0.4)"}`,
                    borderRadius: 8, color: done[w.id] ? "#4ade80" : "var(--goud)",
                    fontWeight: 700, fontSize: "0.9rem", padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  {saving[w.id] ? "…" : done[w.id] ? "✓ Opgeslagen" : "Opslaan"}
                </button>
                {(w.status === "FINISHED" || (w.homeScore !== null)) && (
                  <button
                    onClick={() => wisUitslag(w.id)}
                    disabled={wisBusy[w.id]}
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 8, color: "#f87171",
                      fontWeight: 700, fontSize: "0.9rem", padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                    }}
                    title="Uitslag wissen"
                  >
                    {wisBusy[w.id] ? "…" : "✕"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
