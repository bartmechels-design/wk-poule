"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export default function LandingPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLang();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setLoading(false); return; }

    const res = await fetch(`/api/groepen/code/${trimmed}`);
    setLoading(false);
    if (!res.ok) {
      setError(t.joinError);
      return;
    }
    router.push(`/speel/${trimmed}`);
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      {/* Logo */}
      <div className="centreer anim-fade" style={{ marginBottom: "3rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }} className="trophy-anim">🏆</div>
        <h1 className="tekst-goud" style={{ fontSize: "2.8rem", letterSpacing: "-0.04em" }}>
          {t.appTitle}
        </h1>
        <p className="tekst-dim" style={{ marginTop: "0.4rem", fontSize: "1rem" }}>
          {t.appTagline}
        </p>
      </div>

      {/* Code invoer */}
      <div className="kaart anim-in" style={{ maxWidth: "420px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.2rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚽</span>
          <div>
            <h2 style={{ fontSize: "1.1rem" }}>{t.joinTitle}</h2>
            <p className="tekst-dim" style={{ fontSize: "0.82rem" }}>{t.joinSub}</p>
          </div>
        </div>

        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <input
            className="invoer"
            placeholder={t.joinPlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoFocus
            style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "0.2em" }}
          />
          {error && (
            <p style={{ color: "#f87171", fontSize: "0.82rem", textAlign: "center" }}>{error}</p>
          )}
          <button type="submit" disabled={loading || !code.trim()} className="btn btn-goud btn-lg">
            {loading ? t.joinSearching : t.joinButton}
          </button>
        </form>
      </div>

      {/* Scheiding */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0", width: "100%", maxWidth: "420px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        <span className="tekst-dim" style={{ fontSize: "0.8rem" }}>{t.joinOr}</span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
      </div>

      {/* Leerkracht */}
      <Link href="/auth/login" style={{ textDecoration: "none" }}>
        <button className="btn btn-ghost">
          {t.teacherLogin}
        </button>
      </Link>
    </main>
  );
}
