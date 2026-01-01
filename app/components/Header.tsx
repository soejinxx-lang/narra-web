"use client";

import Link from "next/link";
import { useState } from "react";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";

export default function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        borderBottom: "1px solid #e5e5e5",
        background: "#faf8f3",
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="narra-logo"
          style={{
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          NARRA
        </Link>
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <SearchBar />
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            fontSize: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ☰
        </button>
      </div>

      <MobileMenu open={open} onClose={closeMenu} />
    </header>
  );
}
