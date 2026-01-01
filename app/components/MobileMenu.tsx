"use client";

import { useEffect, useRef } from "react";
import NavMenu from "./NavMenu";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <nav
      ref={navRef}
      style={{
        position: "absolute",
        top: 56,
        left: 0,
        width: "100%",
        background: "#faf8f3",
        borderTop: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        zIndex: 10,
      }}
    >
      <NavMenu />
    </nav>
  );
}
