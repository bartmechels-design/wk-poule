"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NieuweGroepForm() {
  const [naam, setNaam] = useState("");
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    setLoading(true);
    const res = await fetch("/api/groepen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: naam.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { alert(data.error ?? "Fout bij aanmaken"); return; }
    setSucces(`Aangemaakt! Code: ${data.code}`);
    setNaam("");
    router.refresh();
    setTimeout(() => setSucces(""), 5000);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem" }}>
        <input
          className="invoer"
          style={{ flex: 1 }}
          placeholder="Naam van de klas (bijv. Klas 6A)"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          maxLength={50}
        />
        <button type="submit" disabled={loading || !naam.trim()} className="btn btn-goud" style={{ whiteSpace: "nowrap" }}>
          {loading ? "…" : "Aanmaken"}
        </button>
      </form>
      {succes && (
        <div style={{ marginTop: "0.75rem", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "0.6rem 1rem", color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
          ✅ {succes}
        </div>
      )}
    </div>
  );
}
