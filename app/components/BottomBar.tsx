"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "../../lib/i18n";

// ✅ 사업자 정보 (추후 환경변수 또는 관리자 설정으로 전환 가능)
const businessInfo = {
  name: "도파시스",
  owner: "박서진",
  registrationNumber: "166-08-03583",
  address: "대구광역시 동구 송라로10길 33, 103동 902호(신천동, 동대구역센트럴시티자이)",
  ecommerceNumber: null as string | null, // 통신판매업 신고 전이면 null
  email: "contact@narra.kr",
};

export default function BottomBar() {
  const { locale } = useLocale();
  const [showBizInfo, setShowBizInfo] = useState(false);
  const isKorean = locale === "ko";

  return (
    <footer
      style={{
        width: "100%",
        padding: "32px 24px 28px",
        background: "#3a3a3a",
        color: "#fff",
      }}
    >
      {/* 법적 링크 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/terms"
          style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: "13px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        >
          {isKorean ? "이용약관" : "Terms of Service"}
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <Link
          href="/privacy"
          style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: "13px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        >
          {isKorean ? "개인정보처리방침" : "Privacy Policy"}
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <Link
          href="/support"
          style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: "13px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        >
          FAQ
        </Link>
      </div>

      {/* 저작권 + 연락처 */}
      <div
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "rgba(255,255,255,0.35)",
          marginBottom: "16px",
        }}
      >
        © 2026 NARRA · contact@narra.kr
      </div>

      {/* 사업자 정보 (접이식) */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => setShowBizInfo(!showBizInfo)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: "12px",
            cursor: "pointer",
            padding: "4px 8px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          {showBizInfo ? "▲" : "▼"} {isKorean ? "사업자 정보" : "Business Information"}
        </button>

        {showBizInfo && (
          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.8,
            }}
          >
            <p>{isKorean ? "상호" : "Company"}: {businessInfo.name}</p>
            <p>{isKorean ? "대표" : "Representative"}: {businessInfo.owner}</p>
            <p>{isKorean ? "사업자등록번호" : "Business Reg. No."}: {businessInfo.registrationNumber}</p>
            <p>{isKorean ? "소재지" : "Address"}: {businessInfo.address}</p>
            {businessInfo.ecommerceNumber && (
              <p>{isKorean ? "통신판매업신고번호" : "E-commerce Reg. No."}: {businessInfo.ecommerceNumber}</p>
            )}
            <p>{isKorean ? "이메일" : "Email"}: {businessInfo.email}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
