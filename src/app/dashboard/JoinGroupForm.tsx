"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroupForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/groepen/code/${code.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kon niet toetreden tot groep");
        setLoading(false);
        return;
      }

      setCode("");
      router.refresh();
    } catch (err) {
      setError("Fout bij verbinding");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleJoin} style={{ display: "flex", gap: "0.75rem" }}>
      <input
        className="invoer"
        style={{ flex: 1 }}
        placeholder="Voer klascode in (bijv. ABC123)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={10}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="btn btn-goud"
        style={{ whiteSpace: "nowrap" }}
      >
        {loading ? "…" : "➕ Deelnemen"}
      </button>
      {error && <div style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "0.25rem" }}>{error}</div>}
    </form>
  );
}
