"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackBtn({ label = "← Terug", href }: { label?: string; href?: string }) {
  const router = useRouter();
  const style = {
    background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8, padding: "0.3rem 0.7rem", cursor: "pointer",
    color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
    display: "flex", alignItems: "center", gap: "0.35rem",
    transition: "all 0.15s",
  } as React.CSSProperties;

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}><button style={style}>{label}</button></Link>;
  }
  return <button onClick={() => router.back()} style={style}>{label}</button>;
}

export default function NavBar({
  left, right,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0.6rem 1.2rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {left}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {right}
      </div>
    </div>
  );
}

export function HomeBtn() {
  return (
    <Link href="/" style={{ textDecoration: "none" }}>
      <button style={{
        background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8, padding: "0.3rem 0.7rem", cursor: "pointer",
        color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
        display: "flex", alignItems: "center", gap: "0.35rem",
        transition: "all 0.15s",
      }}>
        🏠 Home
      </button>
    </Link>
  );
}

export function DashboardBtn() {
  return (
    <Link href="/dashboard" style={{ textDecoration: "none" }}>
      <button style={{
        background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8, padding: "0.3rem 0.7rem", cursor: "pointer",
        color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
        display: "flex", alignItems: "center", gap: "0.35rem",
        transition: "all 0.15s",
      }}>
        📋 Dashboard
      </button>
    </Link>
  );
}
