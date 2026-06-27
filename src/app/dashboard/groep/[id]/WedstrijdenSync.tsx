"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WedstrijdenSync({ aantalWedstrijden }: { aantalWedstrijden: number }) {
  const [loading, setLoading] = useState(false);
  const [bericht, setBericht] = useState("");
  const [knockoutLoading, setKnockoutLoading] = useState(false);
  const [knockoutBericht, setKnockoutBericht] = useState("");
  const router = useRouter();

  async function sync() {
    setLoading(true);
    setBericht("");
    try {
      const res = await fetch("/api/wedstrijden/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBericht(`✅ ${data.message}`);
        router.refresh();
      } else {
        setBericht(`❌ ${data.error}`);
      }
    } catch {
      setBericht("❌ Verbindingsfout");
    }
    setLoading(false);
  }

  async function generateKnockout() {
    setKnockoutLoading(true);
    setKnockoutBericht("");
    try {
      const res = await fetch("/api/wedstrijden/generate-knockout", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setKnockoutBericht(`✅ ${data.message}`);
        router.refresh();
      } else {
        setKnockoutBericht(`❌ ${data.error}`);
      }
    } catch {
      setKnockoutBericht("❌ Verbindingsfout");
    }
    setKnockoutLoading(false);
  }

  return (
    <div>
      <p className="tekst-dim" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        {aantalWedstrijden === 0
          ? "Nog geen wedstrijden geladen. Synchroniseer met de football API."
          : `${aantalWedstrijden} wedstrijden geladen. Synchroniseer om uitslagen bij te werken.`}
      </p>
      <button onClick={sync} disabled={loading} className="btn btn-goud">
        {loading ? "⏳ Synchroniseren..." : "🔄 Wedstrijden synchroniseren"}
      </button>
      {bericht && (
        <div style={{
          marginTop: "0.75rem", fontSize: "0.85rem", fontWeight: 600,
          padding: "0.6rem 1rem", borderRadius: "8px",
          background: bericht.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${bericht.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: bericht.startsWith("✅") ? "#4ade80" : "#f87171",
        }}>
          {bericht}
        </div>
      )}
      <p className="tekst-dim" style={{ fontSize: "0.75rem", marginTop: "0.6rem" }}>
        Uitslagen worden elke nacht automatisch bijgewerkt. Klik hier om direct te synchroniseren.
      </p>

      <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--rand)" }}>
        <p className="tekst-dim" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Genereer de eliminatieronde wedstrijden op basis van de huidige poulestand.
        </p>
        <button onClick={generateKnockout} disabled={knockoutLoading} className="btn btn-goud">
          {knockoutLoading ? "⏳ Genereren..." : "🏆 Eliminatieronde genereren"}
        </button>
        {knockoutBericht && (
          <div style={{
            marginTop: "0.75rem", fontSize: "0.85rem", fontWeight: 600,
            padding: "0.6rem 1rem", borderRadius: "8px",
            background: knockoutBericht.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${knockoutBericht.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
            color: knockoutBericht.startsWith("✅") ? "#4ade80" : "#f87171",
          }}>
            {knockoutBericht}
          </div>
        )}
      </div>
    </div>
  );
}
