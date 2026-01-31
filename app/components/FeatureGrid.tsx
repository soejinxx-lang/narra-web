"use client";

import Link from "next/link";

export default function FeatureGrid() {
  const features = [
    { title: "Author", href: "/authors" },
    { title: "Daily Check-in", href: "/daily-checkin" },
    { title: "Fan Art", href: "/fanart" },
    { title: "Philosophy", href: "/guide" },
    { title: "Community", href: "/community" },
    { title: "Music", href: "/music" },
    { title: "Browse All", href: "/novels" },
    { title: "Search", href: "/browse" },
    { title: "QNA", href: "/support" },
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
        feature.title === "Philosophy" ? (
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

