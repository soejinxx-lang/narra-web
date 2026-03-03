"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

// locale 변경 시 dynamic import (클라이언트 전용)
const loaders: Record<Locale, () => Promise<Dict>> = {
    ko: () => import("./ko").then(m => m.default),
    en: () => import("./en").then(m => m.default),
    ja: () => import("./ja").then(m => m.default),
    zh: () => import("./zh").then(m => m.default),
    es: () => import("./es").then(m => m.default),
    fr: () => import("./fr").then(m => m.default),
    de: () => import("./de").then(m => m.default),
    pt: () => import("./pt").then(m => m.default),
    id: () => import("./id").then(m => m.default),
};

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

// en fallback dict — static import (항상 필요하므로)
import enDict from "./en";

interface LocaleProviderProps {
    children: ReactNode;
    initialLocale?: Locale;
    initialDict?: Dict;
}

export function LocaleProvider({ children, initialLocale, initialDict }: LocaleProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale || "en");
    const [dict, setDict] = useState<Dict>(initialDict || enDict);

    // 서버에서 initialLocale/initialDict가 안 넘어온 경우만 localStorage 사용
    useEffect(() => {
        if (initialLocale) {
            // 서버에서 결정됨, localStorage와 동기화만
            localStorage.setItem("narra-locale", initialLocale);
            return;
        }
        const saved = localStorage.getItem("narra-locale") as Locale | null;
        if (saved && saved !== locale && loaders[saved]) {
            // cookie도 동기화 (기존 사용자 마이그레이션)
            document.cookie = `narra-locale=${saved};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
            loaders[saved]().then((d) => {
                setLocaleState(saved);
                setDict(d);
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setLocale = useCallback((l: Locale) => {
        if (l === locale) return;
        setLocaleState(l);
        localStorage.setItem("narra-locale", l);
        // cookie도 설정 → 서버(layout.tsx)에서 읽을 수 있도록
        document.cookie = `narra-locale=${l};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
        // locale 변경 시만 dynamic import
        loaders[l]().then(setDict);
    }, [locale]);

    const t = useCallback(
        (key: string) => {
            const val = resolve(dict, key);
            if (val !== key) return val;
            // fallback to English
            if (locale !== "en") {
                const enVal = resolve(enDict, key);
                if (enVal !== key) return enVal;
            }
            return key;
        },
        [dict, locale]
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
