"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../lib/i18n";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "";

type PlanType = "free" | "basic" | "author_pro" | "reader_premium";

const TIERS = [
    {
        key: "free" as PlanType,
        name: "Free",
        price: 0,
        features_ko: ["소설 3개", "번역 3회/소설", "엔티티 추출 5회", "기본 지원"],
        features_en: ["3 novels", "3 translations/novel", "5 entity extractions", "Standard support"],
        cta_ko: "현재 플랜",
        cta_en: "Current Plan",
    },
    {
        key: "basic" as PlanType,
        name: "Basic",
        price: 9.99,
        features_ko: ["소설 10개", "번역 30회/월", "엔티티 추출 50회", "이메일 지원"],
        features_en: ["10 novels", "30 translations/month", "50 entity extractions", "Email support"],
        cta_ko: "Basic 시작",
        cta_en: "Get Basic",
    },
    {
        key: "author_pro" as PlanType,
        name: "Author Pro",
        price: 14.99,
        popular: true,
        features_ko: ["소설 무제한", "번역 무제한", "엔티티 추출 무제한", "우선 지원", "7일 무료 체험"],
        features_en: ["Unlimited novels", "Unlimited translations", "Unlimited entity extractions", "Priority support", "7-day free trial"],
        cta_ko: "Pro 무료 체험 시작",
        cta_en: "Start Free Trial",
    },
];

export default function PricingPage() {
    const { locale } = useLocale();
    const isKorean = locale === "ko";

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
                const token = localStorage.getItem("authToken") || "";
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
        setCheckoutLoading(plan);
        try {
            const res = await fetch(`${ADMIN_BASE}/api/ls/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, plan }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(isKorean ? "결제 페이지 생성 실패" : "Failed to create checkout");
                setCheckoutLoading(null);
            }
        } catch {
            alert(isKorean ? "네트워크 오류" : "Network error");
            setCheckoutLoading(null);
        }
    };

    const isCurrentPlan = (key: PlanType) => currentPlan === key;
    const isUpgrade = (key: PlanType) => {
        const order: PlanType[] = ["free", "basic", "author_pro"];
        return order.indexOf(key) > order.indexOf(currentPlan);
    };

    return (
        <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px 100px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <h1 style={{
                    fontSize: "36px", fontWeight: 700, color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif', marginBottom: "12px",
                }}>
                    {isKorean ? "작가를 위한 플랜" : "Plans for Authors"}
                </h1>
                <p style={{ fontSize: "16px", color: "#888", maxWidth: "500px", margin: "0 auto" }}>
                    {isKorean
                        ? "9개 언어 자동 번역으로 전 세계 독자에게 다가가세요"
                        : "Reach global readers with automatic translation to 9 languages"}
                </p>
            </div>

            {/* 결제 성공 */}
            {successMessage && (
                <div style={{
                    padding: "16px 20px", background: "#e8f5e9", border: "1px solid #66bb6a",
                    borderRadius: "12px", marginBottom: "32px", textAlign: "center",
                    fontSize: "15px", color: "#2e7d32", fontWeight: 500,
                }}>
                    ✨ {isKorean ? "구독이 활성화되었습니다! 감사합니다." : "Your subscription is now active! Thank you."}
                </div>
            )}

            {/* 미끼 효과 안내 */}
            <div style={{
                textAlign: "center", marginBottom: "32px",
                fontSize: "14px", color: "#667",
            }}>
                {isKorean
                    ? `💡 Pro는 Basic보다 단 $${(14.99 - 9.99).toFixed(0)}만 더 내면 무제한입니다`
                    : `💡 Pro is unlimited for just $${(14.99 - 9.99).toFixed(0)} more than Basic`}
            </div>

            {/* Pricing Cards */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px", marginBottom: "48px",
            }}>
                {TIERS.map((tier) => {
                    const isCurrent = isCurrentPlan(tier.key);
                    const isPopular = tier.popular;
                    const features = isKorean ? tier.features_ko : tier.features_en;

                    return (
                        <div
                            key={tier.key}
                            style={{
                                background: isPopular
                                    ? "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)"
                                    : "#fff",
                                borderRadius: "16px",
                                padding: isPopular ? "36px 24px" : "32px 24px",
                                border: isPopular
                                    ? "2px solid #f9a825"
                                    : isCurrent
                                        ? "2px solid #243A6E"
                                        : "1px solid #e5e5e5",
                                color: isPopular ? "#fff" : "#333",
                                position: "relative",
                                transform: isPopular ? "scale(1.03)" : "none",
                                boxShadow: isPopular ? "0 8px 32px rgba(36,58,110,0.2)" : "none",
                            }}
                        >
                            {/* Popular 뱃지 */}
                            {isPopular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "linear-gradient(135deg, #f9a825 0%, #ff8f00 100%)",
                                    color: "#fff", fontSize: "12px", fontWeight: 700,
                                    padding: "4px 16px", borderRadius: "12px",
                                    letterSpacing: "0.5px",
                                }}>
                                    ⭐ {isKorean ? "인기!" : "POPULAR"}
                                </div>
                            )}

                            {/* 현재 플랜 뱃지 */}
                            {isCurrent && !isPopular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#243A6E", color: "#fff",
                                    fontSize: "12px", fontWeight: 600,
                                    padding: "4px 16px", borderRadius: "12px",
                                }}>
                                    {isKorean ? "현재" : "CURRENT"}
                                </div>
                            )}

                            <h3 style={{
                                fontSize: "20px", fontWeight: 600,
                                marginBottom: "8px", textAlign: "center",
                            }}>
                                {tier.name}
                            </h3>

                            <div style={{
                                fontSize: "40px", fontWeight: 700,
                                textAlign: "center", marginBottom: "24px",
                            }}>
                                {tier.price === 0 ? (
                                    <span>$0</span>
                                ) : (
                                    <>
                                        ${tier.price}
                                        <span style={{
                                            fontSize: "14px", fontWeight: 400,
                                            opacity: isPopular ? 0.8 : 0.5,
                                        }}>
                                            /{isKorean ? "월" : "mo"}
                                        </span>
                                    </>
                                )}
                            </div>

                            <ul style={{
                                listStyle: "none", padding: 0,
                                fontSize: "14px", lineHeight: 2.2,
                                opacity: isPopular ? 0.95 : 1,
                            }}>
                                {features.map((f, i) => (
                                    <li key={i}>
                                        {tier.key === "free" ? "✅" : "✨"} {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            {tier.key !== "free" && (
                                <button
                                    disabled={isCurrent || checkoutLoading === tier.key}
                                    onClick={() => handleCheckout(tier.key)}
                                    style={{
                                        marginTop: "24px", width: "100%",
                                        padding: "14px", borderRadius: "10px",
                                        border: "none",
                                        background: isCurrent
                                            ? (isPopular ? "rgba(255,255,255,0.3)" : "#e5e5e5")
                                            : isPopular ? "#fff" : "#243A6E",
                                        color: isCurrent
                                            ? (isPopular ? "#fff" : "#999")
                                            : isPopular ? "#243A6E" : "#fff",
                                        fontSize: "15px", fontWeight: 600,
                                        cursor: isCurrent ? "default" : "pointer",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isCurrent) {
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    {checkoutLoading === tier.key
                                        ? (isKorean ? "처리 중..." : "Processing...")
                                        : isCurrent
                                            ? (isKorean ? "사용 중" : "Active")
                                            : isUpgrade(tier.key)
                                                ? (isKorean ? tier.cta_ko : tier.cta_en)
                                                : (isKorean ? "구독 관리" : "Manage")}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 비교 테이블 */}
            <div style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #e5e5e5", overflow: "hidden", marginBottom: "48px",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#f8f8f8" }}>
                            <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                                {isKorean ? "기능" : "Feature"}
                            </th>
                            <th style={{ padding: "16px", textAlign: "center", fontWeight: 600 }}>Free</th>
                            <th style={{ padding: "16px", textAlign: "center", fontWeight: 600 }}>Basic</th>
                            <th style={{ padding: "16px", textAlign: "center", fontWeight: 600, color: "#243A6E" }}>
                                Pro ⭐
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { label_ko: "소설", label_en: "Novels", free: "3", basic: "10", pro: "∞" },
                            { label_ko: "번역", label_en: "Translations", free: "9 total", basic: "30/mo", pro: "∞" },
                            { label_ko: "엔티티 추출", label_en: "Entity Extract", free: "5", basic: "50", pro: "∞" },
                            { label_ko: "지원", label_en: "Support", free: "—", basic: "✉️", pro: "⚡" },
                            { label_ko: "가격", label_en: "Price", free: "$0", basic: "$9.99", pro: "$14.99" },
                        ].map((row, i) => (
                            <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                                    {isKorean ? row.label_ko : row.label_en}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#888" }}>
                                    {row.free}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#888" }}>
                                    {row.basic}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#243A6E", fontWeight: 600 }}>
                                    {row.pro}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FAQ */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e5e5" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#243A6E", marginBottom: "24px" }}>FAQ</h2>
                <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. Pro를 쓰다가 Free로 돌아가면?" : "Q. What if I cancel Pro?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "결제 기간 동안 혜택이 유지됩니다. 이후 Free로 전환되며, 3개 소설 / 3회 번역으로 제한됩니다."
                            : "Benefits continue until the end of billing period. Then you'll switch to Free (3 novels / 3 translations)."}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. 무료 체험은 어떻게 되나요?" : "Q. How does the free trial work?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "Pro 첫 구독 시 7일 무료 체험이 제공됩니다. 7일 안에 해지하면 요금이 청구되지 않습니다."
                            : "Your first Pro subscription includes a 7-day trial. Cancel within 7 days and you won't be charged."}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. Basic에서 Pro로 업그레이드 가능?" : "Q. Can I upgrade from Basic to Pro?"}
                    </p>
                    <p style={{ color: "#888" }}>
                        {isKorean
                            ? "네! 언제든 업그레이드 가능합니다. 기존 결제는 일할 정산됩니다."
                            : "Yes! You can upgrade anytime. Your existing payment will be prorated."}
                    </p>
                </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", marginTop: "32px" }}>
                {isKorean ? "결제 관련 문의: contact@narra.kr" : "Payment inquiries: contact@narra.kr"}
            </p>
        </main>
    );
}
