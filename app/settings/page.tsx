"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, LOCALE_NAMES, Locale } from "../../lib/i18n";

const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

export default function SettingsPage() {
    const { locale, setLocale, t } = useLocale();
    const [plan, setPlan] = useState<string>("free");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; name?: string } | null>(null);

    useEffect(() => {
        const loadPlan = async () => {
            const stored = localStorage.getItem("loggedInUser") || localStorage.getItem("currentUser");
            if (!stored) return;

            try {
                const userData = JSON.parse(stored);
                setUser(userData);

                const token = localStorage.getItem("authToken") || "";
                const res = await fetch(`${STORAGE}/api/user/plan`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlan(data.plan_type || "free");
                    setExpiresAt(data.expires_at || null);
                }
            } catch {
                // ignore
            }
        };
        loadPlan();
    }, []);

    const isKorean = locale === "ko";
    const isPremium = plan === "premium";

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

            {/* Subscription */}
            {user && (
                <section style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 8 }}>
                        {isKorean ? "구독 상태" : "Subscription"}
                    </h2>

                    <div
                        style={{
                            padding: "16px 20px",
                            background: isPremium
                                ? "linear-gradient(135deg, #f3e7ff 0%, #e8eaff 100%)"
                                : "#fff",
                            border: `1px solid ${isPremium ? "#d1c4e9" : "#e5e5e5"}`,
                            borderRadius: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "15px", color: isPremium ? "#4a148c" : "#333" }}>
                                {isPremium ? "✨ Premium" : "Free"}
                            </div>
                            {isPremium && expiresAt && (
                                <div style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
                                    {isKorean ? "다음 갱신: " : "Next renewal: "}
                                    {new Date(expiresAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {isPremium ? (
                            <a
                                href="https://narra.lemonsqueezy.com/billing"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: "8px 16px",
                                    background: "#243A6E",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {isKorean ? "구독 관리" : "Manage"}
                            </a>
                        ) : (
                            <Link
                                href="/premium"
                                style={{
                                    padding: "8px 16px",
                                    background: "#243A6E",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                }}
                            >
                                {isKorean ? "Premium 구독" : "Get Premium"}
                            </Link>
                        )}
                    </div>
                </section>
            )}

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
