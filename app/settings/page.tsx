"use client";

import { useLocale, LOCALE_NAMES, Locale } from "../../lib/i18n";

const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];

export default function SettingsPage() {
    const { locale, setLocale, t } = useLocale();

    return (
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
            <h1
                style={{
                    fontFamily: '"KoPub Batang", serif',
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#243A6E",
                    marginBottom: 32,
                }}
            >
                {t("settings.title")}
            </h1>

            {/* Language */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 8 }}>
                    {t("settings.language")}
                </h2>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
                    {t("settings.languageDesc")}
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 8,
                    }}
                >
                    {LOCALES.map((code) => (
                        <button
                            key={code}
                            onClick={() => setLocale(code)}
                            style={{
                                padding: "12px 16px",
                                border: locale === code ? "2px solid #243A6E" : "1px solid #e5e5e5",
                                background: locale === code ? "#f0f3fa" : "#fff",
                                color: locale === code ? "#243A6E" : "#333",
                                fontWeight: locale === code ? 600 : 400,
                                fontSize: 14,
                                cursor: "pointer",
                                borderRadius: 0,
                                textAlign: "left",
                                transition: "all 0.15s",
                            }}
                        >
                            {LOCALE_NAMES[code]}
                        </button>
                    ))}
                </div>
            </section>
        </main>
    );
}
