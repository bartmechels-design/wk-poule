"use client";

import { useLang } from "@/components/LanguageProvider";
import { HomeBtn, BackBtn } from "@/components/NavBar";

export default function SpeelHeader({ groepNaam }: { groepNaam: string }) {
  const { t } = useLang();
  return (
    <>
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 1rem" }}>
      <BackBtn href="/" />
      <HomeBtn />
    </div>
    <div className="centreer anim-fade" style={{ marginBottom: "2rem", marginTop: "0.5rem" }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--goud)", marginBottom: "0.4rem" }}>
        ⚽ {t.appTitle}
      </div>
      <h1 style={{ fontSize: "2rem" }}>{groepNaam}</h1>
      <p className="tekst-dim" style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>
        {t.clickName}
      </p>
    </div>
    </>
  );
}
