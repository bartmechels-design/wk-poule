import type { Metadata } from "next";
import "./globals.css";
import StadionAchtergrond from "@/components/StadionAchtergrond";
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const metadata: Metadata = {
  title: "WK Poule 2026",
  description: "Voorspel de WK 2026 wedstrijden met jouw klas!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ background: "transparent", minHeight: "100vh" }}>
        <StadionAchtergrond />
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
