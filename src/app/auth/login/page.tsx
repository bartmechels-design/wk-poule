"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError("Verkeerd e-mailadres of wachtwoord."); return; }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="centreer anim-fade" style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏫</div>
        <h1 style={{ fontSize: "1.8rem" }}>Leerkracht inloggen</h1>
        <p className="tekst-dim" style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>Beheer jouw WK poule klassen</p>
      </div>

      <div className="kaart anim-in" style={{ maxWidth: 400, width: "100%" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--tekst-dim)", marginBottom: "0.4rem" }}>E-mailadres</label>
            <input type="email" className="invoer" placeholder="naam@school.be" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--tekst-dim)", marginBottom: "0.4rem" }}>Wachtwoord</label>
            <input type="password" className="invoer" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "0.7rem 1rem", color: "#f87171", fontSize: "0.85rem" }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-goud btn-lg" style={{ marginTop: "0.5rem" }}>
            {loading ? "Inloggen…" : "Inloggen"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.82rem", color: "var(--tekst-dim)" }}>
          Nog geen account? <Link href="/auth/register" style={{ color: "var(--goud)", textDecoration: "none", fontWeight: 600 }}>Registreer hier</Link>
        </p>
      </div>
      <Link href="/" style={{ marginTop: "1.5rem" }}><button className="btn btn-ghost btn-sm">← Terug</button></Link>
    </main>
  );
}
