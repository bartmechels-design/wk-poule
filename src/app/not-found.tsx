import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>😅</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--goud)", marginBottom: "0.5rem" }}>
        Pagina niet gevonden
      </h1>
      <p className="tekst-dim" style={{ marginBottom: "2rem", fontSize: "0.95rem" }}>
        Deze pagina bestaat niet, of de groepscode klopt niet.
      </p>
      <Link href="/">
        <button className="btn btn-goud btn-lg">⚽ Terug naar begin</button>
      </Link>
    </main>
  );
}
