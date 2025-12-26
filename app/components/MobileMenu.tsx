"use client";

import NavMenu from "./NavMenu";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 56,
          right: 0,
          width: "220px",
          background: "#faf8f3",
          borderLeft: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <NavMenu />
      </div>
    </div>
  );
}

