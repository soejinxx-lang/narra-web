"use client";

import { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #e5e5e5",
          background: "#faf8f3",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <strong>NARRA</strong>

        <button
          onClick={() => setOpen(true)}
          style={{
            fontSize: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
