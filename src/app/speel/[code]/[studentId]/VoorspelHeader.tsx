"use client";

import { useLang } from "@/components/LanguageProvider";
import { HomeBtn, BackBtn } from "@/components/NavBar";

export default function VoorspelHeader({
  code, name, groupName, totalPoints, aantalVoorspeld, totaal,
}: {
  code: string; name: string; groupName: string;
  totalPoints: number; aantalVoorspeld: number; totaal: number;
}) {
  const { t } = useLang();
  const voortgang = totaal > 0 ? (aantalVoorspeld / totaal) * 100 : 0;

  return (
    <>
      <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", padding: "0.7rem 1.2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <BackBtn />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, color: "var(--goud)", fontSize: "1rem" }}>👋 {name}</div>
          <div className="tekst-dim" style={{ fontSize: "0.75rem" }}>{groupName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--goud)" }}>{totalPoints}</div>
            <div className="tekst-dim" style={{ fontSize: "0.7rem" }}>{t.points}</div>
          </div>
          <HomeBtn />
        </div>
      </div>

      <div className="kaart anim-fade" style={{ margin: "1.5rem auto 1.2rem", maxWidth: 680, padding: "0.9rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--tekst-dim)" }}>{t.yourPredictions}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--tekst-dim)" }}>{aantalVoorspeld}/{totaal}</span>
        </div>
        <div className="voortgang-balk">
          <div className="voortgang-vulling" style={{ width: `${voortgang}%` }} />
        </div>
      </div>
    </>
  );
}
