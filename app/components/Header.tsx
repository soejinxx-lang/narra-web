"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header
      style={{
        position: "relative",
        borderBottom: "1px solid #e5e5e5",
        background: "#faf8f3",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Link
          href="/"
          onClick={closeMenu}
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          NARRA
        </Link>
        <button
          onClick={() => setOpen(!open)}
          style={{
            fontSize: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <nav
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            width: "100%",
            background: "#faf8f3",
            borderTop: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          {[
            { href: "/novels", label: "All Novels" },
            { href: "/browse", label: "Browse" },
            { href: "/about", label: "About NARRA" },
            { href: "/notes", label: "Translation Notes" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              style={{
                display: "block",
                padding: "16px",
                borderBottom: "1px solid #e5e5e5",
                textDecoration: "none",
                color: "black",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

