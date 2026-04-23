"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";

type Leerling = { id: string; name: string; totalPoints: number; allesIngevuld: boolean };

export default function NaamKiezer({ groepCode, leerlingen }: { groepCode: string; leerlingen: Leerling[] }) {
  const router = useRouter();
  const { t } = useLang();

  if (leerlingen.length === 0) {
    return (
      <div className="kaart centreer" style={{ maxWidth: 480, width: "100%", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😅</div>
        <p className="tekst-dim">{t.noStudents}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, width: "100%" }}>
      <div className="kaart-dark" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table className="sport-table" style={{ width: "100%", minWidth: 300 }}>
          <thead>
            <tr>
              <th>#</th>
              <th>{t.name}</th>
              <th style={{ textAlign: "right" }}>Ingevuld</th>
              <th style={{ textAlign: "right" }}>{t.points}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leerlingen.map((l, i) => (
              <tr
                key={l.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/speel/${groepCode}/${l.id}`)}
              >
                <td className="tekst-dim" style={{ width: 40, fontWeight: 700 }}>{i + 1}</td>
                <td>
                  <div className="flex-midden gap-sm">
                    <span style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 700, color: "var(--goud)"
                    }}>
                      {l.name.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 600, color: "white" }}>{l.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                    borderRadius: 6,
                    background: l.allesIngevuld ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
                    color: l.allesIngevuld ? "#4ade80" : "#f87171",
                    border: `1px solid ${l.allesIngevuld ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
                    whiteSpace: "nowrap",
                  }}>
                    {l.allesIngevuld ? "✓ Ja" : "✗ Nee"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {l.totalPoints > 0
                    ? <span className="punten-badge hoog">{l.totalPoints} pt</span>
                    : <span className="punten-badge nul">0 pt</span>
                  }
                </td>
                <td style={{ textAlign: "right", width: 40 }}>
                  <span className="tekst-dim" style={{ fontSize: "1rem" }}>›</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
