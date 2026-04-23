"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Lang, T } from "@/lib/i18n";

type AnyTranslation = typeof T[Lang];
type LangContext = { lang: Lang; setLang: (l: Lang) => void; t: AnyTranslation };

const Ctx = createContext<LangContext>({ lang: "nl", setLang: () => {}, t: T.nl as AnyTranslation });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    const stored = localStorage.getItem("wk-lang") as Lang | null;
    if (stored && ["nl", "pap", "en", "es"].includes(stored)) setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("wk-lang", l);
  }

  return <Ctx.Provider value={{ lang, setLang, t: T[lang] as AnyTranslation }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
