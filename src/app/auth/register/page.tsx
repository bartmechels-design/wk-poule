"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", school: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    if (form.password.length < 6) {
      setError("Wachtwoord moet minstens 6 tekens lang zijn.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, school: form.school, email: form.email, password: form.password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Er is iets fout gegaan.");
      return;
    }

    router.push("/auth/login?registered=1");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="centreer anim-fade" style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✏️</div>
        <h1 style={{ fontSize: "1.8rem" }}>Account aanmaken</h1>
        <p className="tekst-dim" style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>Maak jouw eigen WK poule aan</p>
      </div>

      <div className="kaart anim-in" style={{ maxWidth: 420, width: "100%" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {[
            { field: "name", label: "Jouw naam", type: "text", placeholder: "Jan Janssen", required: true },
            { field: "school", label: "School (optioneel)", type: "text", placeholder: "Basisschool De Zon", required: false },
            { field: "email", label: "E-mailadres", type: "email", placeholder: "naam@school.be", required: true },
            { field: "password", label: "Wachtwoord", type: "password", placeholder: "Min. 6 tekens", required: true },
            { field: "confirm", label: "Wachtwoord herhalen", type: "password", placeholder: "Herhaal wachtwoord", required: true },
          ].map(({ field, label, type, placeholder, required }) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--tekst-dim)", marginBottom: "0.4rem" }}>
                {label}
              </label>
              <input
                type={type}
                className="invoer"
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={update(field)}
                required={required}
              />
            </div>
          ))}

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "0.7rem 1rem", color: "#f87171", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-goud btn-lg" style={{ marginTop: "0.5rem" }}>
            {loading ? "Bezig..." : "Account aanmaken"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.82rem", color: "var(--tekst-dim)" }}>
          Al een account?{" "}
          <Link href="/auth/login" style={{ color: "var(--goud)", textDecoration: "none", fontWeight: 600 }}>
            Inloggen
          </Link>
        </p>
      </div>

      <Link href="/" style={{ marginTop: "1.5rem" }}><button className="btn btn-ghost btn-sm">← Terug</button></Link>
    </main>
  );
}
