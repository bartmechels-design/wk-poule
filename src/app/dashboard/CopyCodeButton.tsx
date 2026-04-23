"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", padding: "0.3rem 0.7rem", fontFamily: "monospace", fontWeight: 800, fontSize: "1rem", color: "var(--goud)", letterSpacing: "0.1em" }}>
        {code}
      </div>
      <button
        onClick={copy}
        title="Kopieer code"
        style={{
          background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.15)"}`,
          borderRadius: "7px", padding: "0.3rem 0.5rem",
          cursor: "pointer", fontSize: "0.8rem",
          color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
          transition: "all 0.15s", whiteSpace: "nowrap",
        }}
      >
        {copied ? "✓" : "📋"}
      </button>
    </div>
  );
}
