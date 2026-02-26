"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLocale } from "../../lib/i18n";

export default function FeatureGrid() {
  const { t } = useLocale();
  const [shouldAnimateQnA, setShouldAnimateQnA] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("hasVisitedNARRA");

      if (!hasVisited) {
        // First visit - trigger animation
        setShouldAnimateQnA(true);
        localStorage.setItem("hasVisitedNARRA", "true");
      }
    }
  }, []);

  const features = [
    { title: t("feature.author"), key: "author", href: "/authors" },
    { title: t("feature.dailyCheckin"), key: "dailyCheckin", href: "/daily-checkin" },
    { title: t("feature.fanArt"), key: "fanArt", href: "/fanart" },
    { title: t("feature.philosophy"), key: "philosophy", href: "/guide" },
    { title: t("feature.community"), key: "community", href: "/community" },
    { title: t("feature.music"), key: "music", href: "/music" },
    { title: t("feature.browseAll"), key: "browseAll", href: "/novels" },
    { title: t("feature.search"), key: "search", href: "/browse" },
    { title: t("feature.qna"), key: "qna", href: "/support" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginLeft: "-0.1cm",
      }}
    >
      {features.map((feature, index) => (
        feature.key === "philosophy" ? (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #e5e5e5",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "0",
            }}
          >
          </div>
        ) : (
          <Link
            key={index}
            href={feature.href}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                border: "1px solid #e5e5e5",
                aspectRatio: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "0",
                ...(feature.key === "qna" && shouldAnimateQnA ? {
                  animation: "rollQnA 2s ease-in-out forwards",
                } : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#243A6E",
                  fontFamily: '"KoPub Batang", serif',
                }}
              >
                {feature.title}
              </div>
            </div>
          </Link>
        )
      ))}
    </div>
  );
}

