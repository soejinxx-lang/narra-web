"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../lib/i18n";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "";

type PlanType = "free" | "reader_premium" | "author_starter" | "author_pro";
type BillingCycle = "monthly" | "annual";

const PLAN_ORDER: PlanType[] = ["free", "reader_premium", "author_starter", "author_pro"];

const PRICES = {
    reader_premium: { monthly: 4.99, annual: 49.99 },
    author_starter: { monthly: 7.99, annual: 79.99 },
    author_pro: { monthly: 12.99, annual: 129.99 },
};

function getCheckoutKey(plan: PlanType, cycle: BillingCycle): string {
    if (plan === "free") return "";
    return `${plan}_${cycle}`;
}

export default function PricingPage() {
    const { t } = useLocale();

    const [cycle, setCycle] = useState<BillingCycle>("annual");
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.search.includes("success=true")) {
            setSuccessMessage(true);
            window.history.replaceState({}, "", "/pricing");
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            const stored = localStorage.getItem("loggedInUser") || localStorage.getItem("currentUser");
            if (!stored) { setLoading(false); return; }
            try {
                const userData = JSON.parse(stored);
                setUser(userData);
                const rawToken = localStorage.getItem("authToken") || "";
                let token = rawToken;
                try { const p = JSON.parse(rawToken); token = p?.value ?? rawToken; } catch { /* raw */ }
                const res = await fetch(`${STORAGE}/api/user/plan`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPlan(data.plan_type || "free");
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        load();
    }, []);

    const handleCheckout = async (plan: PlanType) => {
        if (!user) { window.location.href = "/login"; return; }
        const key = getCheckoutKey(plan, cycle);
        if (!key) return;
        setCheckoutLoading(plan);
        try {
            const res = await fetch(`${ADMIN_BASE}/api/ls/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, plan: key }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(t("pricing.checkoutFail"));
                setCheckoutLoading(null);
            }
        } catch {
            alert(t("pricing.networkError"));
            setCheckoutLoading(null);
        }
    };

    const isCurrentPlan = (key: PlanType) => currentPlan === key;
    const isUpgrade = (key: PlanType) => PLAN_ORDER.indexOf(key) > PLAN_ORDER.indexOf(currentPlan);

    const getDisplayPrice = (key: "reader_premium" | "author_starter" | "author_pro") => {
        const p = PRICES[key];
        if (cycle === "monthly") return p.monthly;
        return Math.round((p.annual / 12) * 100) / 100;
    };

    const getSavingsPercent = (key: "reader_premium" | "author_starter" | "author_pro") => {
        const p = PRICES[key];
        return Math.round((1 - p.annual / (p.monthly * 12)) * 100);
    };

    const PAID_PLANS = [
        {
            key: "reader_premium" as const,
            name: "Reader Plus",
            popular: false,
            features: [
                t("pricing.readerPlus.f1"), t("pricing.readerPlus.f2"), t("pricing.readerPlus.f3"),
                t("pricing.readerPlus.f4"), t("pricing.readerPlus.f5"),
            ],
            cta: t("pricing.readerPlus.cta"),
        },
        {
            key: "author_starter" as const,
            name: "Author Starter",
            popular: false,
            features: [
                t("pricing.starter.f1"), t("pricing.starter.f2"), t("pricing.starter.f3"),
                t("pricing.starter.f4"), t("pricing.starter.f5"),
            ],
            cta: t("pricing.starter.cta"),
        },
        {
            key: "author_pro" as const,
            name: "Author Pro",
            popular: true,
            features: [
                t("pricing.pro.f1"), t("pricing.pro.f2"), t("pricing.pro.f3"),
                t("pricing.pro.f4"), t("pricing.pro.f5"), t("pricing.pro.f6"),
            ],
            cta: t("pricing.pro.cta"),
        },
    ];

    return (
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 100px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{
                    fontSize: "36px", fontWeight: 700, color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif', marginBottom: "12px",
                }}>
                    {t("pricing.title")}
                </h1>
                <p style={{ fontSize: "16px", color: "#888", maxWidth: "550px", margin: "0 auto" }}>
                    {t("pricing.subtitle")}
                </p>
            </div>

            {/* Success */}
            {successMessage && (
                <div style={{
                    padding: "16px 20px", background: "#e8f5e9", border: "1px solid #66bb6a",
                    borderRadius: "12px", marginBottom: "32px", textAlign: "center",
                    fontSize: "15px", color: "#2e7d32", fontWeight: 500,
                }}>
                    ✨ {t("pricing.successMsg")}
                </div>
            )}

            {/* Billing Toggle */}
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: "12px", marginBottom: "40px",
            }}>
                <span style={{
                    fontSize: "14px", fontWeight: cycle === "monthly" ? 600 : 400,
                    color: cycle === "monthly" ? "#243A6E" : "#999", cursor: "pointer",
                }} onClick={() => setCycle("monthly")}>
                    {t("pricing.monthly")}
                </span>

                <button
                    onClick={() => setCycle(cycle === "monthly" ? "annual" : "monthly")}
                    style={{
                        width: "56px", height: "30px", borderRadius: "15px",
                        border: "none", cursor: "pointer", position: "relative",
                        background: cycle === "annual"
                            ? "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)" : "#ccc",
                        transition: "background 0.3s",
                    }}
                >
                    <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: "#fff", position: "absolute", top: "3px",
                        left: cycle === "annual" ? "29px" : "3px",
                        transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }} />
                </button>

                <span style={{
                    fontSize: "14px", fontWeight: cycle === "annual" ? 600 : 400,
                    color: cycle === "annual" ? "#243A6E" : "#999", cursor: "pointer",
                }} onClick={() => setCycle("annual")}>
                    {t("pricing.annual")}
                </span>

                {cycle === "annual" && (
                    <span style={{
                        fontSize: "12px", fontWeight: 600, color: "#fff",
                        background: "linear-gradient(135deg, #f9a825 0%, #ff8f00 100%)",
                        padding: "4px 10px", borderRadius: "10px",
                    }}>
                        ✨ {t("pricing.twoMonthsFree")}
                    </span>
                )}
            </div>

            {/* Pricing Cards */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px", marginBottom: "48px",
            }}>
                {/* Free Card */}
                <div style={{
                    background: "#fff", borderRadius: "16px", padding: "32px 20px",
                    border: isCurrentPlan("free") ? "2px solid #243A6E" : "1px solid #e5e5e5",
                    position: "relative",
                }}>
                    {isCurrentPlan("free") && (
                        <div style={{
                            position: "absolute", top: "-12px", left: "50%",
                            transform: "translateX(-50%)", background: "#243A6E", color: "#fff",
                            fontSize: "11px", fontWeight: 600, padding: "4px 14px", borderRadius: "10px",
                        }}>
                            {t("pricing.current")}
                        </div>
                    )}
                    <h3 style={{ fontSize: "18px", fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>Free</h3>
                    <div style={{ fontSize: "36px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>$0</div>
                    <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", marginBottom: "24px" }}>
                        {t("pricing.freeForever")}
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "13px", lineHeight: 2.2, color: "#555" }}>
                        {[t("pricing.free.readAll"), t("pricing.free.trans"), t("pricing.free.novel"), t("pricing.free.entity"), t("pricing.free.adIncluded")].map((f, i) => (
                            <li key={i}>✅ {f}</li>
                        ))}
                    </ul>
                </div>

                {/* Paid Cards */}
                {PAID_PLANS.map((plan) => {
                    const isCurrent = isCurrentPlan(plan.key);
                    const displayPrice = getDisplayPrice(plan.key);
                    const savings = getSavingsPercent(plan.key);
                    const price = PRICES[plan.key];

                    return (
                        <div
                            key={plan.key}
                            style={{
                                background: plan.popular
                                    ? "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)" : "#fff",
                                borderRadius: "16px",
                                padding: plan.popular ? "36px 20px" : "32px 20px",
                                border: plan.popular ? "2px solid #f9a825"
                                    : isCurrent ? "2px solid #243A6E" : "1px solid #e5e5e5",
                                color: plan.popular ? "#fff" : "#333",
                                position: "relative",
                                transform: plan.popular ? "scale(1.03)" : "none",
                                boxShadow: plan.popular ? "0 8px 32px rgba(36,58,110,0.2)" : "none",
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "linear-gradient(135deg, #f9a825 0%, #ff8f00 100%)",
                                    color: "#fff", fontSize: "11px", fontWeight: 700,
                                    padding: "4px 14px", borderRadius: "10px",
                                }}>
                                    ⭐ {t("pricing.popular")}
                                </div>
                            )}
                            {isCurrent && !plan.popular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)", background: "#243A6E", color: "#fff",
                                    fontSize: "11px", fontWeight: 600, padding: "4px 14px", borderRadius: "10px",
                                }}>
                                    {t("pricing.current")}
                                </div>
                            )}

                            <h3 style={{ fontSize: "18px", fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
                                {plan.name}
                            </h3>
                            <div style={{ fontSize: "36px", fontWeight: 700, textAlign: "center", marginBottom: "4px" }}>
                                ${displayPrice.toFixed(2)}
                                <span style={{ fontSize: "14px", fontWeight: 400, opacity: plan.popular ? 0.8 : 0.5 }}>
                                    /{t("pricing.perMonth")}
                                </span>
                            </div>
                            <p style={{
                                fontSize: "12px",
                                color: plan.popular ? "rgba(255,255,255,0.7)" : "#aaa",
                                textAlign: "center", marginBottom: "24px",
                            }}>
                                {cycle === "annual"
                                    ? `$${price.annual} ${t("pricing.billedAnnually")} · ${savings}% ${t("pricing.off")}`
                                    : `$${price.monthly} ${t("pricing.billedMonthly")}`}
                            </p>

                            <ul style={{
                                listStyle: "none", padding: 0, fontSize: "13px", lineHeight: 2.2,
                                color: plan.popular ? "#fff" : "#555",
                            }}>
                                {plan.features.map((f, i) => (
                                    <li key={i}>{i === 0 && plan.key !== "reader_premium" ? "💎" : "✨"} {f}</li>
                                ))}
                            </ul>

                            <button
                                disabled={isCurrent || checkoutLoading === plan.key || loading}
                                onClick={() => handleCheckout(plan.key)}
                                style={{
                                    marginTop: "24px", width: "100%", padding: "14px", borderRadius: "10px",
                                    border: "none",
                                    background: isCurrent
                                        ? (plan.popular ? "rgba(255,255,255,0.3)" : "#e5e5e5")
                                        : plan.popular ? "#fff" : "#243A6E",
                                    color: isCurrent
                                        ? (plan.popular ? "#fff" : "#999")
                                        : plan.popular ? "#243A6E" : "#fff",
                                    fontSize: "14px", fontWeight: 600,
                                    cursor: isCurrent ? "default" : "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isCurrent) {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {checkoutLoading === plan.key
                                    ? t("pricing.processing")
                                    : isCurrent
                                        ? t("pricing.active")
                                        : isUpgrade(plan.key) ? plan.cta : t("pricing.manage")}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Comparison hint */}
            <div style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#667" }}>
                💡 {t("pricing.comparisonHint")}
            </div>

            {/* Comparison Table */}
            <div style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #e5e5e5", overflow: "hidden", marginBottom: "48px",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#f8f8f8" }}>
                            <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600 }}>{t("pricing.feature")}</th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600 }}>Free</th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#4a7cf7" }}>Reader Plus</th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#243A6E" }}>Starter</th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#243A6E" }}>Pro ⭐</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { label: t("pricing.readEpisodes"), free: "✅", reader: "✅", starter: "✅", pro: "✅" },
                            { label: t("pricing.ads"), free: t("pricing.adsYes"), reader: "❌", starter: "❌", pro: "❌" },
                            { label: t("pricing.earlyAccess"), free: "❌", reader: "✅", starter: "✅", pro: "✅" },
                            { label: t("pricing.vipBadge"), free: "❌", reader: "✅", starter: "✅", pro: "✅" },
                            { label: t("pricing.translations"), free: "3/day", reader: "3/day", starter: "15/day", pro: "∞" },
                            { label: t("pricing.novels"), free: "3/day", reader: "3/day", starter: "10/day", pro: "∞" },
                            { label: t("pricing.entityExtract"), free: "5/day", reader: "5/day", starter: "20/day", pro: "∞" },
                            { label: t("pricing.priorityQueue"), free: "❌", reader: "❌", starter: "❌", pro: "✅" },
                            { label: t("pricing.priceMonthly"), free: "$0", reader: "$4.99", starter: "$7.99", pro: "$12.99" },
                        ].map((row, i) => (
                            <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{row.label}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#888" }}>{row.free}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#4a7cf7" }}>{row.reader}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#555" }}>{row.starter}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#243A6E", fontWeight: 600 }}>{row.pro}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FAQ */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e5e5" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#243A6E", marginBottom: "24px" }}>
                    {t("pricing.faq.title")}
                </h2>
                <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.8 }}>
                    {[
                        { q: t("pricing.faq.q1"), a: t("pricing.faq.a1") },
                        { q: t("pricing.faq.q2"), a: t("pricing.faq.a2") },
                        { q: t("pricing.faq.q3"), a: t("pricing.faq.a3") },
                        { q: t("pricing.faq.q4"), a: t("pricing.faq.a4") },
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: i < 3 ? "20px" : 0 }}>
                            <p style={{ fontWeight: 600, marginBottom: "4px" }}>{item.q}</p>
                            <p style={{ color: "#888" }}>{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", marginTop: "32px" }}>
                {t("pricing.contact")}
            </p>

            <style>{`
                @media (max-width: 800px) {
                    main > div:nth-child(4) { grid-template-columns: 1fr !important; }
                    main > div:nth-child(4) > div:nth-child(4) { transform: none !important; }
                }
            `}</style>
        </main>
    );
}
