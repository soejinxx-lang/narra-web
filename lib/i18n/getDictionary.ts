// 서버 전용 — dynamic import로 요청된 locale만 로드
// 클라이언트 번들에 포함되지 않음

import type { Locale } from "./index";

type Dict = Record<string, unknown>;

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

export async function getDictionary(locale: Locale): Promise<Dict> {
    const load = loaders[locale] || loaders.en;
    return await load();
}
