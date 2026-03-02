"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "../../lib/i18n";

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
            <p>{isKorean ? "상호: [사업자 등록 정보]" : "Company: [Business Registration Info]"}</p>
            <p>{isKorean ? "대표: [대표자명]" : "Representative: [Name]"}</p>
            <p>{isKorean ? "사업자등록번호: [등록번호]" : "Business Registration No.: [Number]"}</p>
            <p>{isKorean ? "통신판매업신고번호: [준비 중]" : "E-commerce Registration: [Pending]"}</p>
            <p>{isKorean ? "이메일: contact@narra.kr" : "Email: contact@narra.kr"}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
