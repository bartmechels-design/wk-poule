"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Leerling = {
  id: string;
  name: string;
  totalPoints: number;
  _count: { predictions: number };
};

export default function LeerlingenBeheer({
  groepId,
  leerlingen,
}: {
  groepId: string;
  leerlingen: Leerling[];
}) {
  const [naam, setNaam] = useState("");
  const [bulk, setBulk] = useState("");
  const [toonBulk, setToonBulk] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function voegToe(namen: string[]) {
    setLoading(true);
    for (const n of namen) {
      if (!n.trim()) continue;
      await fetch(`/api/groepen/${groepId}/leerlingen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam: n.trim() }),
      });
    }
    setLoading(false);
    setNaam("");
    setBulk("");
    router.refresh();
  }

  async function verwijder(leerlingId: string) {
    if (!confirm("Weet je zeker dat je deze leerling verwijdert? Alle voorspellingen gaan verloren.")) return;
    await fetch(`/api/leerlingen/${leerlingId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {/* Enkelvoudig toevoegen */}
      <form
        onSubmit={(e) => { e.preventDefault(); voegToe([naam]); }}
        style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}
      >
        <input
          className="invoer"
          style={{ flex: 1 }}
          placeholder="Naam van leerling"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          maxLength={50}
        />
        <button type="submit" disabled={loading || !naam.trim()} className="btn btn-goud" style={{ whiteSpace: "nowrap" }}>
          {loading ? "…" : "➕ Toevoegen"}
        </button>
      </form>

      {/* Bulk toevoegen toggle */}
      <button
        type="button"
        onClick={() => setToonBulk(!toonBulk)}
        style={{ background: "none", border: "none", color: "var(--goud)", fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: "1rem", textDecoration: "underline" }}
      >
        {toonBulk ? "Verberg bulk invoer" : "📋 Meerdere leerlingen tegelijk toevoegen"}
      </button>

      {toonBulk && (
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            className="invoer"
            style={{ minHeight: 120, resize: "vertical" }}
            placeholder={"Zet elke naam op een nieuwe regel:\nEmma\nLiam\nSofia\n..."}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <button
            type="button"
            onClick={() => voegToe(bulk.split("\n"))}
            disabled={loading || !bulk.trim()}
            className="btn btn-goud"
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Bezig..." : "Alle namen toevoegen"}
          </button>
        </div>
      )}

      {/* Leerlingenlijst */}
      {leerlingen.length === 0 ? (
        <div className="centreer" style={{ padding: "2rem 0", color: "var(--tekst-dim)", fontSize: "0.9rem" }}>
          Nog geen leerlingen. Voeg ze hierboven toe!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
          {leerlingen.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "0.6rem 1rem",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, color: "var(--goud)", flexShrink: 0,
                }}>
                  {l.name.charAt(0).toUpperCase()}
                </span>
                <span style={{ fontWeight: 600 }}>{l.name}</span>
                <span className="tekst-dim" style={{ fontSize: "0.78rem" }}>
                  {l._count.predictions} voorspelling{l._count.predictions !== 1 ? "en" : ""}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontWeight: 700, color: "var(--goud)", fontSize: "0.9rem" }}>
                  {l.totalPoints} pt
                </span>
                <button
                  onClick={() => verwijder(l.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(248,113,113,0.6)", fontSize: "0.85rem", padding: "0.2rem 0.4rem",
                    borderRadius: "6px", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,113,113,0.6)")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
