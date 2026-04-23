"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGES } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} style={{ position: "fixed", top: "0.7rem", right: "1rem", zIndex: 1000 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10, padding: "0.4rem 0.7rem",
          cursor: "pointer", color: "white",
          transition: "border-color 0.15s",
        }}
      >
        <img src={current.flag} alt={current.label} style={{ width: 22, borderRadius: 3 }} />
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
          {lang === "pap" ? "PAP" : lang.toUpperCase()}
        </span>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "rgba(10,20,10,0.92)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, overflow: "hidden",
          minWidth: 170,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.7rem",
                width: "100%", padding: "0.6rem 1rem",
                background: lang === l.code ? "rgba(245,158,11,0.15)" : "transparent",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer", textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = lang === l.code ? "rgba(245,158,11,0.15)" : "transparent"; }}
            >
              <img src={l.flag} alt={l.label} style={{ width: 24, borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", fontWeight: lang === l.code ? 700 : 400, color: lang === l.code ? "var(--goud)" : "rgba(255,255,255,0.8)" }}>
                {l.label}
              </span>
              {lang === l.code && <span style={{ marginLeft: "auto", color: "var(--goud)", fontSize: "0.75rem" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
