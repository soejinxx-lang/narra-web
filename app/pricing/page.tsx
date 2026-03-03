"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../lib/i18n";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "";

type PlanType = "free" | "reader_premium" | "author_starter" | "author_pro";
type BillingCycle = "monthly" | "annual";

const PLANS = {
    reader_premium: {
        name: "Reader Plus",
        monthly: 4.99,
        annual: 49.99,
        color: "#4a7cf7",
        features_ko: [
            "광고 완전 제거",
            "신작 24h 선공개 접근",
            "VIP 뱃지",
            "독서 통계 대시보드",
            "프로필 커스텀",
        ],
        features_en: [
            "Ad-free experience",
            "24h early access to new episodes",
            "VIP badge",
            "Reading stats dashboard",
            "Profile customization",
        ],
        cta_ko: "Reader Plus 시작",
        cta_en: "Get Reader Plus",
    },
    author_starter: {
        name: "Author Starter",
        monthly: 7.99,
        annual: 79.99,
        color: "#243A6E",
        features_ko: [
            "Reader Plus 혜택 전부 포함",
            "번역 15회/일",
            "소설 10개/일",
            "고유명사 추출 20회/일",
            "이메일 지원",
        ],
        features_en: [
            "All Reader Plus benefits",
            "15 translations/day",
            "10 novels/day",
            "20 entity extractions/day",
            "Email support",
        ],
        cta_ko: "Starter 시작",
        cta_en: "Get Starter",
    },
    author_pro: {
        name: "Author Pro",
        monthly: 12.99,
        annual: 129.99,
        color: "#243A6E",
        popular: true,
        features_ko: [
            "Reader Plus 혜택 전부 포함",
            "번역 무제한",
            "소설 무제한",
            "고유명사 추출 무제한",
            "우선 번역 큐",
            "Pro 전용 골드 뱃지",
        ],
        features_en: [
            "All Reader Plus benefits",
            "Unlimited translations",
            "Unlimited novels",
            "Unlimited entity extractions",
            "Priority translation queue",
            "Exclusive Pro gold badge",
        ],
        cta_ko: "Pro 시작",
        cta_en: "Get Pro",
    },
};

const PLAN_ORDER: PlanType[] = ["free", "reader_premium", "author_starter", "author_pro"];

function getCheckoutKey(plan: PlanType, cycle: BillingCycle): string {
    if (plan === "free") return "";
    return `${plan}_${cycle}`;
}

export default function PricingPage() {
    const { locale } = useLocale();
    const isKorean = locale === "ko";

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
                alert(isKorean ? "결제 페이지 생성 실패" : "Failed to create checkout");
                setCheckoutLoading(null);
            }
        } catch {
            alert(isKorean ? "네트워크 오류" : "Network error");
            setCheckoutLoading(null);
        }
    };

    const isCurrentPlan = (key: PlanType) => currentPlan === key;
    const isUpgrade = (key: PlanType) => PLAN_ORDER.indexOf(key) > PLAN_ORDER.indexOf(currentPlan);

    const getDisplayPrice = (plan: typeof PLANS.reader_premium) => {
        if (cycle === "monthly") return plan.monthly;
        return Math.round((plan.annual / 12) * 100) / 100;
    };

    const getSavingsPercent = (plan: typeof PLANS.reader_premium) => {
        return Math.round((1 - plan.annual / (plan.monthly * 12)) * 100);
    };

    return (
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 100px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{
                    fontSize: "36px", fontWeight: 700, color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif', marginBottom: "12px",
                }}>
                    {isKorean ? "당신에게 맞는 플랜을 선택하세요" : "Choose the plan that fits you"}
                </h1>
                <p style={{ fontSize: "16px", color: "#888", maxWidth: "550px", margin: "0 auto" }}>
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

            {/* Billing Toggle */}
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: "12px", marginBottom: "40px",
            }}>
                <span style={{
                    fontSize: "14px", fontWeight: cycle === "monthly" ? 600 : 400,
                    color: cycle === "monthly" ? "#243A6E" : "#999",
                    cursor: "pointer",
                }} onClick={() => setCycle("monthly")}>
                    {isKorean ? "월간" : "Monthly"}
                </span>

                <button
                    onClick={() => setCycle(cycle === "monthly" ? "annual" : "monthly")}
                    style={{
                        width: "56px", height: "30px", borderRadius: "15px",
                        border: "none", cursor: "pointer", position: "relative",
                        background: cycle === "annual"
                            ? "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)"
                            : "#ccc",
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
                    color: cycle === "annual" ? "#243A6E" : "#999",
                    cursor: "pointer",
                }} onClick={() => setCycle("annual")}>
                    {isKorean ? "연간" : "Annual"}
                </span>

                {cycle === "annual" && (
                    <span style={{
                        fontSize: "12px", fontWeight: 600, color: "#fff",
                        background: "linear-gradient(135deg, #f9a825 0%, #ff8f00 100%)",
                        padding: "4px 10px", borderRadius: "10px",
                        animation: "pulse 2s infinite",
                    }}>
                        ✨ {isKorean ? "2개월 무료" : "2 months free"}
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
                            transform: "translateX(-50%)",
                            background: "#243A6E", color: "#fff",
                            fontSize: "11px", fontWeight: 600,
                            padding: "4px 14px", borderRadius: "10px",
                        }}>
                            {isKorean ? "현재" : "CURRENT"}
                        </div>
                    )}
                    <h3 style={{ fontSize: "18px", fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
                        Free
                    </h3>
                    <div style={{ fontSize: "36px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>
                        $0
                    </div>
                    <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", marginBottom: "24px" }}>
                        {isKorean ? "영원히 무료" : "Free forever"}
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "13px", lineHeight: 2.2, color: "#555" }}>
                        {(isKorean
                            ? ["모든 에피소드 무료 열람", "번역 3회/일", "소설 3개/일", "고유명사 추출 5회/일", "광고 포함"]
                            : ["Read all episodes free", "3 translations/day", "3 novels/day", "5 entity extractions/day", "Ads included"]
                        ).map((f, i) => (
                            <li key={i}>✅ {f}</li>
                        ))}
                    </ul>
                </div>

                {/* Paid Cards */}
                {(["reader_premium", "author_starter", "author_pro"] as const).map((key) => {
                    const plan = PLANS[key];
                    const isCurrent = isCurrentPlan(key);
                    const isPopular = "popular" in plan && plan.popular;
                    const displayPrice = getDisplayPrice(plan);
                    const savings = getSavingsPercent(plan);
                    const features = isKorean ? plan.features_ko : plan.features_en;

                    return (
                        <div
                            key={key}
                            style={{
                                background: isPopular
                                    ? "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)"
                                    : "#fff",
                                borderRadius: "16px",
                                padding: isPopular ? "36px 20px" : "32px 20px",
                                border: isPopular
                                    ? "2px solid #f9a825"
                                    : isCurrent
                                        ? "2px solid #243A6E"
                                        : "1px solid #e5e5e5",
                                color: isPopular ? "#fff" : "#333",
                                position: "relative",
                                transform: isPopular ? "scale(1.03)" : "none",
                                boxShadow: isPopular ? "0 8px 32px rgba(36,58,110,0.2)" : "none",
                                transition: "transform 0.3s, box-shadow 0.3s",
                            }}
                        >
                            {/* Popular 뱃지 */}
                            {isPopular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "linear-gradient(135deg, #f9a825 0%, #ff8f00 100%)",
                                    color: "#fff", fontSize: "11px", fontWeight: 700,
                                    padding: "4px 14px", borderRadius: "10px",
                                    letterSpacing: "0.5px",
                                }}>
                                    ⭐ {isKorean ? "추천!" : "BEST VALUE"}
                                </div>
                            )}

                            {/* Current 뱃지 */}
                            {isCurrent && !isPopular && (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#243A6E", color: "#fff",
                                    fontSize: "11px", fontWeight: 600,
                                    padding: "4px 14px", borderRadius: "10px",
                                }}>
                                    {isKorean ? "현재" : "CURRENT"}
                                </div>
                            )}

                            <h3 style={{
                                fontSize: "18px", fontWeight: 600,
                                textAlign: "center", marginBottom: "8px",
                            }}>
                                {plan.name}
                            </h3>

                            {/* Price */}
                            <div style={{
                                fontSize: "36px", fontWeight: 700,
                                textAlign: "center", marginBottom: "4px",
                            }}>
                                ${displayPrice.toFixed(2)}
                                <span style={{
                                    fontSize: "14px", fontWeight: 400,
                                    opacity: isPopular ? 0.8 : 0.5,
                                }}>
                                    /{isKorean ? "월" : "mo"}
                                </span>
                            </div>

                            {/* Annual billing info */}
                            <p style={{
                                fontSize: "12px",
                                color: isPopular ? "rgba(255,255,255,0.7)" : "#aaa",
                                textAlign: "center", marginBottom: "24px",
                            }}>
                                {cycle === "annual"
                                    ? `$${plan.annual} ${isKorean ? "연간 결제" : "billed annually"} · ${savings}% ${isKorean ? "절약" : "off"}`
                                    : `$${plan.monthly} ${isKorean ? "매월 결제" : "billed monthly"}`}
                            </p>

                            {/* Features */}
                            <ul style={{
                                listStyle: "none", padding: 0,
                                fontSize: "13px", lineHeight: 2.2,
                                opacity: isPopular ? 0.95 : 1,
                                color: isPopular ? "#fff" : "#555",
                            }}>
                                {features.map((f, i) => (
                                    <li key={i}>
                                        {key === "reader_premium" ? "✨" : i === 0 ? "💎" : "✨"} {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                disabled={isCurrent || checkoutLoading === key || loading}
                                onClick={() => handleCheckout(key)}
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
                                {checkoutLoading === key
                                    ? (isKorean ? "처리 중..." : "Processing...")
                                    : isCurrent
                                        ? (isKorean ? "사용 중" : "Active")
                                        : isUpgrade(key)
                                            ? (isKorean ? plan.cta_ko : plan.cta_en)
                                            : (isKorean ? "구독 관리" : "Manage")}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Comparison hint */}
            <div style={{
                textAlign: "center", marginBottom: "40px",
                fontSize: "14px", color: "#667",
            }}>
                {isKorean
                    ? `💡 Author Pro는 Starter보다 단 $${(12.99 - 7.99).toFixed(0)}만 더 내면 무제한입니다`
                    : `💡 Author Pro is unlimited for just $${(12.99 - 7.99).toFixed(0)} more than Starter`}
            </div>

            {/* 비교 테이블 */}
            <div style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #e5e5e5", overflow: "hidden", marginBottom: "48px",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#f8f8f8" }}>
                            <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600 }}>
                                {isKorean ? "기능" : "Feature"}
                            </th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600 }}>Free</th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#4a7cf7" }}>
                                Reader Plus
                            </th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#243A6E" }}>
                                Starter
                            </th>
                            <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#243A6E" }}>
                                Pro ⭐
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { label_ko: "에피소드 열람", label_en: "Read episodes", free: "✅", reader: "✅", starter: "✅", pro: "✅" },
                            { label_ko: "광고", label_en: "Ads", free: isKorean ? "있음" : "Yes", reader: "❌", starter: "❌", pro: "❌" },
                            { label_ko: "선공개 접근", label_en: "Early access", free: "❌", reader: "✅", starter: "✅", pro: "✅" },
                            { label_ko: "VIP 뱃지", label_en: "VIP badge", free: "❌", reader: "✅", starter: "✅", pro: "✅" },
                            { label_ko: "번역", label_en: "Translations", free: "3/day", reader: "3/day", starter: "15/day", pro: "∞" },
                            { label_ko: "소설 생성", label_en: "Novels", free: "3/day", reader: "3/day", starter: "10/day", pro: "∞" },
                            { label_ko: "고유명사 추출", label_en: "Entity extract", free: "5/day", reader: "5/day", starter: "20/day", pro: "∞" },
                            { label_ko: "우선 번역 큐", label_en: "Priority queue", free: "❌", reader: "❌", starter: "❌", pro: "✅" },
                            {
                                label_ko: "가격 (월간)", label_en: "Price (monthly)",
                                free: "$0", reader: "$4.99", starter: "$7.99", pro: "$12.99",
                            },
                        ].map((row, i) => (
                            <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                                    {isKorean ? row.label_ko : row.label_en}
                                </td>
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
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#243A6E", marginBottom: "24px" }}>FAQ</h2>
                <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. Author Pro를 구독하면 Reader Plus 혜택도 받나요?" : "Q. Does Author Pro include Reader Plus benefits?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "네! Author Pro와 Author Starter 모두 Reader Plus 혜택이 포함됩니다. 광고 제거, 선공개 접근, VIP 뱃지 등을 모두 이용할 수 있습니다."
                            : "Yes! Both Author Pro and Author Starter include all Reader Plus benefits. You get ad-free, early access, VIP badge, and more."}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. 연간 결제를 하면 환불이 되나요?" : "Q. Can I get a refund for annual billing?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "구독 후 14일 이내에 환불 요청이 가능합니다. contact@narra.kr로 연락주세요."
                            : "You can request a refund within 14 days of subscription. Contact contact@narra.kr."}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. 플랜을 변경하거나 취소하면 어떻게 되나요?" : "Q. What happens if I change or cancel my plan?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "결제 기간 동안 혜택이 유지됩니다. 이후 Free로 전환되며, 기존 콘텐츠는 그대로 유지됩니다."
                            : "Benefits continue until the end of billing period. Then you'll switch to Free, and your content will remain intact."}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. Starter에서 Pro로 업그레이드 가능?" : "Q. Can I upgrade from Starter to Pro?"}
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

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                @media (max-width: 800px) {
                    main > div:nth-child(4) {
                        grid-template-columns: 1fr !important;
                    }
                    main > div:nth-child(4) > div:nth-child(4) {
                        transform: none !important;
                    }
                }
            `}</style>
        </main>
    );
}
