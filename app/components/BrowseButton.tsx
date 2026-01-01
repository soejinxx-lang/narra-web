"use client";

import Link from "next/link";

export default function BrowseButton() {
  return (
    <Link
      href="/browse"
      style={{
        display: "block",
        textAlign: "center",
        padding: "12px 24px",
        background: "#243A6E",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: 500,
        fontSize: "14px",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1e2f56";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#243A6E";
      }}
    >
      Browse All Novels
    </Link>
  );
}

