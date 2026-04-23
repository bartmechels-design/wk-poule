"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export default function KlassementLink({ code }: { code: string }) {
  const { t } = useLang();
  return (
    <Link href={`/klassement/${code}`} style={{ color: "var(--goud)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
      🏆 {t.standings}
    </Link>
  );
}
