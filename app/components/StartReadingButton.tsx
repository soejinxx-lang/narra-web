"use client";

import Link from "next/link";

type StartReadingButtonProps = {
  href: string;
};

export default function StartReadingButton({ href }: StartReadingButtonProps) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        background: "#243A6E",
        color: "#fff",
        padding: "10px 24px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        display: "inline-block",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1e2f56";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#243A6E";
      }}
    >
      Start Reading
    </Link>
  );
}

