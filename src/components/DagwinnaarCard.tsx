"use client";

import { useEffect, useState } from "react";

type Dagwinnaar = {
  date: string;
  todayWinner: { name: string; points: number } | null;
  topScorers: { name: string; points: number }[];
};

export default function DagwinnaarCard({ groepCode }: { groepCode: string }) {
  const [data, setData] = useState<Dagwinnaar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/klasment/dagwinnaar?code=${groepCode}&date=${today}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [groepCode]);

  if (loading) return <div className="kaart" style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>Bezig...</div>;

  if (!data?.todayWinner) {
    return (
      <div className="kaart" style={{ padding: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>😴</div>
        <p className="tekst-dim" style={{ fontSize: "0.85rem" }}>Geen wedstrijden vandaag</p>
      </div>
    );
  }

  return (
    <div className="kaart" style={{ padding: "1.5rem", marginBottom: "1.5rem", background: "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--goud)" }}>
          ⚡ Dagwinnaar
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--tekst-dim)" }}>{new Date(data.date).toLocaleDateString("nl-NL")}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ fontSize: "2.5rem" }}>🏆</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--goud)" }}>{data.todayWinner.name}</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "white" }}>{data.todayWinner.points} punten</div>
        </div>
      </div>

      {data.topScorers.length > 1 && (
        <div style={{ fontSize: "0.75rem", color: "var(--tekst-dim)", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Top 5:</div>
          {data.topScorers.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span>{i + 1}. {s.name}</span>
              <span style={{ color: "var(--goud)", fontWeight: 700 }}>{s.points}pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
