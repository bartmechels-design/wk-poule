"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetKnop({ groepId }: { groepId: string }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [gedaan, setGedaan] = useState(false);

  async function reset() {
    if (!confirm("Alle voorspellingen en punten van deze klas wissen?\n\nDit kan niet ongedaan worden gemaakt.")) return;
    setBezig(true);
    const res = await fetch(`/api/groepen/${groepId}/reset`, { method: "POST" });
    setBezig(false);
    if (res.ok) {
      setGedaan(true);
      setTimeout(() => { setGedaan(false); router.refresh(); }, 1500);
    }
  }

  return (
    <button
      onClick={reset}
      disabled={bezig || gedaan}
      className="btn btn-sm"
      style={{
        background: gedaan ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
        border: `1px solid ${gedaan ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.3)"}`,
        color: gedaan ? "#4ade80" : "#f87171",
      }}
    >
      {bezig ? "Bezig…" : gedaan ? "✓ Gereset" : "🗑️ Reset voorspellingen"}
    </button>
  );
}
