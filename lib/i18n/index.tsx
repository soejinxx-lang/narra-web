"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import ko from "./ko";
import en from "./en";
import ja from "./ja";
import zh from "./zh";
import es from "./es";
import fr from "./fr";
import de from "./de";
import pt from "./pt";
import id from "./id";

export type Locale = "ko" | "en" | "ja" | "zh" | "es" | "fr" | "de" | "pt" | "id";

export const LOCALE_NAMES: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    pt: "Português",
    id: "Bahasa Indonesia",
};

type Dict = Record<string, unknown>;

const dictionaries: Record<Locale, Dict> = { ko, en, ja, zh, es, fr, de, pt, id };

type LocaleCtx = {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleCtx>({
    locale: "en",
    setLocale: () => { },
    t: (k) => k,
});

function resolve(dict: Dict, key: string): string {
    const parts = key.split(".");
    let cur: unknown = dict;
    for (const p of parts) {
        if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
            cur = (cur as Record<string, unknown>)[p];
        } else {
            return key;
        }
    }
    return typeof cur === "string" ? cur : key;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        const saved = localStorage.getItem("narra-locale") as Locale | null;
        if (saved && dictionaries[saved]) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("narra-locale", l);
    }, []);

    const t = useCallback(
        (key: string) => {
            const val = resolve(dictionaries[locale], key);
            if (val !== key) return val;
            // fallback to English
            if (locale !== "en") {
                const enVal = resolve(dictionaries.en, key);
                if (enVal !== key) return enVal;
            }
            return key;
        },
        [locale]
    );

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
