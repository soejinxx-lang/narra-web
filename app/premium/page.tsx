"use client";

import { useLocale } from "../../lib/i18n";

export default function PremiumPage() {
    const { t, locale } = useLocale();
    const isKorean = locale === "ko";

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 100px" }}>
            <h1
                style={{
                    fontSize: "36px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif',
                    textAlign: "center",
                }}
            >
                NARRA Premium
            </h1>
            <p
                style={{
                    fontSize: "16px",
                    color: "#888",
                    textAlign: "center",
                    marginBottom: "48px",
                }}
            >
                {isKorean
                    ? "더 깨끗한 독서 경험을 위해"
                    : "For a cleaner reading experience"}
            </p>

            {/* Pricing Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginBottom: "48px",
                }}
            >
                {/* Free Tier */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "32px 24px",
                        border: "1px solid #e5e5e5",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>
                        Free
                    </h3>
                    <div style={{ fontSize: "36px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>
                        $0
                        <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
                            /{isKorean ? "월" : "mo"}
                        </span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", color: "#666", lineHeight: 2.2, textAlign: "left" }}>
                        <li>✅ {isKorean ? "모든 콘텐츠 열람" : "All content access"}</li>
                        <li>✅ {isKorean ? "9개 언어 번역" : "9 language translations"}</li>
                        <li>✅ {isKorean ? "댓글 작성" : "Comment posting"}</li>
                        <li>❌ {isKorean ? "광고 있음" : "Ads shown"}</li>
                    </ul>
                </div>

                {/* Premium Tier */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #243A6E 0%, #4a5ca8 100%)",
                        borderRadius: "16px",
                        padding: "32px 24px",
                        border: "2px solid #667eea",
                        textAlign: "center",
                        color: "#fff",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "-28px",
                            background: "#f9a825",
                            color: "#333",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "4px 32px",
                            transform: "rotate(45deg)",
                        }}
                    >
                        {isKorean ? "추천" : "BEST"}
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
                        Premium
                    </h3>
                    <div style={{ fontSize: "36px", fontWeight: 700, marginBottom: "24px" }}>
                        $4.99
                        <span style={{ fontSize: "14px", fontWeight: 400, opacity: 0.8 }}>
                            /{isKorean ? "월" : "mo"}
                        </span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", lineHeight: 2.2, textAlign: "left", opacity: 0.95 }}>
                        <li>✅ {isKorean ? "모든 무료 혜택 포함" : "All Free benefits"}</li>
                        <li>✨ {isKorean ? "광고 제거" : "Ad-free reading"}</li>
                        <li>✨ {isKorean ? "프로필 커스텀" : "Profile customization"}</li>
                        <li>✨ VIP {isKorean ? "뱃지" : "badge"}</li>
                        <li>✨ {isKorean ? "독서 통계" : "Reading statistics"}</li>
                        <li>✨ {isKorean ? "오프라인 다운로드" : "Offline download"}</li>
                    </ul>

                    <button
                        style={{
                            marginTop: "24px",
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#fff",
                            color: "#243A6E",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                        onClick={() => alert(isKorean ? "Stripe 결제 연동 준비 중입니다." : "Stripe payment integration coming soon.")}
                    >
                        {isKorean ? "Premium 시작하기" : "Get Premium"}
                    </button>
                </div>
            </div>

            {/* FAQ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "32px",
                    border: "1px solid #e5e5e5",
                }}
            >
                <h2
                    style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#243A6E",
                        marginBottom: "24px",
                        fontFamily: '"KoPub Batang", serif',
                    }}
                >
                    FAQ
                </h2>

                <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. Premium 없이도 모든 콘텐츠를 볼 수 있나요?" : "Q. Can I read all content without Premium?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "네! NARRA의 모든 에피소드는 무료입니다. Premium은 광고 제거 등 편의 기능만 제공합니다."
                            : "Yes! All episodes on NARRA are free. Premium only provides convenience features like ad removal."}
                    </p>

                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. 언제든 해지할 수 있나요?" : "Q. Can I cancel anytime?"}
                    </p>
                    <p style={{ marginBottom: "20px", color: "#888" }}>
                        {isKorean
                            ? "네, 언제든 해지 가능합니다. 해지 후에도 결제 기간 동안 혜택을 이용할 수 있습니다."
                            : "Yes, you can cancel anytime. Your benefits continue until the end of the billing period."}
                    </p>

                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {isKorean ? "Q. 유료 전용 콘텐츠가 있나요?" : "Q. Is there premium-exclusive content?"}
                    </p>
                    <p style={{ color: "#888" }}>
                        {isKorean
                            ? "아니요. NARRA에는 유료 전용 콘텐츠가 없습니다. 모든 에피소드는 누구나 무료로 읽을 수 있습니다."
                            : "No. NARRA has no premium-exclusive content. All episodes are free for everyone."}
                    </p>
                </div>
            </div>

            {/* Footer note */}
            <p
                style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#aaa",
                    marginTop: "32px",
                }}
            >
                {isKorean
                    ? "결제 관련 문의: contact@narra.kr"
                    : "Payment inquiries: contact@narra.kr"}
            </p>
        </main>
    );
}
